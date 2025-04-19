
import { createWriteStream, unlink } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import axios from 'axios';
import { pipeline } from 'stream';
import MediaAssetModel from '../models/MediaAsset';
import logger from '../lib/logger';

// AWS SDK for Rekognition
import {
  RekognitionClient,
  DetectTextCommand,
  DetectLabelsCommand,
} from '@aws-sdk/client-rekognition';
import { readFile } from 'fs/promises';

const streamPipeline = promisify(pipeline);
const unlinkFile = promisify(unlink);
const tempDir = process.env.TEMP_DIR || '/tmp';

class ImageAnalysisProcessor {
  private static rekognitionClient: RekognitionClient;
  
  /**
   * Initialize the rekognition client
   */
  private static initClient(): RekognitionClient {
    if (!this.rekognitionClient) {
      this.rekognitionClient = new RekognitionClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
    }
    return this.rekognitionClient;
  }
  
  /**
   * Process an image asset for analysis
   */
  public static async process(assetId: string): Promise<{ success: boolean }> {
    const asset = await MediaAssetModel.findById(assetId);
    
    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }
    
    if (asset.assetType !== 'image') {
      throw new Error(`Asset ${assetId} is not an image`);
    }
    
    try {
      // Update processing status
      asset.processingStatus = 'processing';
      asset.processingAttempts += 1;
      asset.lastProcessedAt = new Date();
      await asset.save();
      
      // Download the image
      const imagePath = await this.downloadImage(asset.url, assetId);
      
      // Read image bytes
      const imageBytes = await readFile(imagePath);
      
      // Detect text in the image
      const detectedText = await this.detectText(imageBytes);
      
      // Detect labels (objects/concepts) in the image
      const labels = await this.detectLabels(imageBytes);
      
      // Clean up local file
      await unlinkFile(imagePath);
      
      // Update asset with analysis results
      asset.detectedText = detectedText;
      asset.labels = labels;
      asset.processingStatus = 'complete';
      await asset.save();
      
      logger.info(`Successfully analyzed image asset ${assetId}`);
      
      return { success: true };
    } catch (error) {
      logger.error(`Error analyzing image asset ${assetId}:`, error);
      
      // Update asset with failure
      asset.processingStatus = 'failed';
      asset.failureReason = error.message || 'Image analysis failed';
      await asset.save();
      
      throw error;
    }
  }
  
  /**
   * Download image from URL
   */
  private static async downloadImage(url: string, assetId: string): Promise<string> {
    const imagePath = join(tempDir, `${assetId}.jpg`);
    
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 30000, // 30 seconds timeout
      });
      
      const writer = createWriteStream(imagePath);
      await streamPipeline(response.data, writer);
      
      return imagePath;
    } catch (error) {
      logger.error(`Error downloading image from ${url}:`, error);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }
  
  /**
   * Detect text in an image using AWS Rekognition
   */
  private static async detectText(imageBytes: Buffer): Promise<string[]> {
    const client = this.initClient();
    
    try {
      const command = new DetectTextCommand({
        Image: {
          Bytes: imageBytes,
        },
      });
      
      const response = await client.send(command);
      
      // Extract detected text
      return (response.TextDetections || [])
        .filter(text => text.Type === 'LINE')
        .map(text => text.DetectedText || '')
        .filter(text => text.length > 0);
    } catch (error) {
      logger.error('Error detecting text in image:', error);
      throw error;
    }
  }
  
  /**
   * Detect labels in an image using AWS Rekognition
   */
  private static async detectLabels(imageBytes: Buffer): Promise<Array<{ name: string; confidence: number }>> {
    const client = this.initClient();
    
    try {
      const command = new DetectLabelsCommand({
        Image: {
          Bytes: imageBytes,
        },
        MinConfidence: 70, // Only return labels with at least 70% confidence
        MaxLabels: 20,
      });
      
      const response = await client.send(command);
      
      // Extract labels
      return (response.Labels || []).map(label => ({
        name: label.Name || '',
        confidence: label.Confidence || 0,
      }));
    } catch (error) {
      logger.error('Error detecting labels in image:', error);
      throw error;
    }
  }
}

export default ImageAnalysisProcessor;
