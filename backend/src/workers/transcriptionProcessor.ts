
import { createWriteStream, unlink } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import axios from 'axios';
import { pipeline } from 'stream';
import MediaAssetModel from '../models/MediaAsset';
import logger from '../lib/logger';

// AWS SDK for Transcribe
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';

const streamPipeline = promisify(pipeline);
const unlinkFile = promisify(unlink);
const tempDir = process.env.TEMP_DIR || '/tmp';

class TranscriptionProcessor {
  private static transcribeClient: TranscribeClient;
  
  /**
   * Initialize the transcription client
   */
  private static initClient(): TranscribeClient {
    if (!this.transcribeClient) {
      this.transcribeClient = new TranscribeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
    }
    return this.transcribeClient;
  }
  
  /**
   * Process a video asset for transcription
   */
  public static async process(assetId: string): Promise<{ success: boolean; transcript?: string }> {
    const asset = await MediaAssetModel.findById(assetId);
    
    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }
    
    if (asset.assetType !== 'video') {
      throw new Error(`Asset ${assetId} is not a video`);
    }
    
    try {
      // Update processing status
      asset.processingStatus = 'processing';
      asset.processingAttempts += 1;
      asset.lastProcessedAt = new Date();
      await asset.save();
      
      // Download the video
      const videoPath = await this.downloadVideo(asset.url, assetId);
      
      // Upload to S3 bucket for processing
      const s3ObjectKey = `media/${assetId}/source.mp4`;
      const s3Url = await this.uploadToS3(videoPath, s3ObjectKey);
      
      // Clean up local file
      await unlinkFile(videoPath);
      
      // Start transcription job
      const jobName = `transcript-${assetId}-${Date.now()}`;
      const transcriptUrl = await this.transcribeAudio(s3Url, jobName);
      
      // Download and parse transcript
      const transcript = await this.downloadTranscript(transcriptUrl);
      
      // Update asset with transcript
      asset.transcript = transcript;
      asset.processingStatus = 'complete';
      await asset.save();
      
      logger.info(`Successfully transcribed asset ${assetId}`);
      
      return { success: true, transcript };
    } catch (error) {
      logger.error(`Error transcribing asset ${assetId}:`, error);
      
      // Update asset with failure
      asset.processingStatus = 'failed';
      asset.failureReason = error.message || 'Transcription failed';
      await asset.save();
      
      throw error;
    }
  }
  
  /**
   * Download video from URL
   */
  private static async downloadVideo(url: string, assetId: string): Promise<string> {
    const videoPath = join(tempDir, `${assetId}.mp4`);
    
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 60000, // 60 seconds timeout
      });
      
      const writer = createWriteStream(videoPath);
      await streamPipeline(response.data, writer);
      
      return videoPath;
    } catch (error) {
      logger.error(`Error downloading video from ${url}:`, error);
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }
  
  /**
   * Upload file to S3
   */
  private static async uploadToS3(filePath: string, objectKey: string): Promise<string> {
    // TODO: Implement S3 upload using AWS SDK
    // For now, return a mock S3 URL for compilation
    const bucketName = process.env.AWS_S3_BUCKET || 'media-assets';
    return `s3://${bucketName}/${objectKey}`;
  }
  
  /**
   * Transcribe audio using AWS Transcribe
   */
  private static async transcribeAudio(s3Url: string, jobName: string): Promise<string> {
    const client = this.initClient();
    
    try {
      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        Media: {
          MediaFileUri: s3Url,
        },
        OutputBucketName: process.env.AWS_S3_BUCKET,
        OutputKey: `transcripts/${jobName}/`,
        LanguageCode: 'en-US',
      });
      
      await client.send(command);
      
      // Poll for job completion
      let complete = false;
      let transcriptUrl = '';
      
      while (!complete) {
        const getJobCommand = new GetTranscriptionJobCommand({
          TranscriptionJobName: jobName,
        });
        
        const jobResponse = await client.send(getJobCommand);
        const job = jobResponse.TranscriptionJob;
        
        if (job?.TranscriptionJobStatus === 'COMPLETED') {
          complete = true;
          transcriptUrl = job.Transcript?.TranscriptFileUri || '';
        } else if (job?.TranscriptionJobStatus === 'FAILED') {
          throw new Error(`Transcription job failed: ${job.FailureReason}`);
        } else {
          // Wait for 5 seconds before checking again
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      return transcriptUrl;
    } catch (error) {
      logger.error('Error starting transcription job:', error);
      throw error;
    }
  }
  
  /**
   * Download and parse transcript JSON
   */
  private static async downloadTranscript(url: string): Promise<string> {
    try {
      // For testing/compilation purposes, return mock transcript
      // TODO: Implement actual transcript download and parsing
      if (!url) return "This is a mock transcript for testing purposes.";
      
      const response = await axios.get(url);
      const transcript = response.data?.results?.transcripts?.[0]?.transcript || '';
      
      return transcript;
    } catch (error) {
      logger.error(`Error downloading transcript from ${url}:`, error);
      throw new Error(`Failed to download transcript: ${error.message}`);
    }
  }
}

export default TranscriptionProcessor;
