
import MediaAssetModel from '../models/MediaAsset';
import logger from '../lib/logger';

// AWS Comprehend client for sentiment analysis
import { 
  ComprehendClient, 
  DetectSentimentCommand,
  DetectDominantLanguageCommand 
} from '@aws-sdk/client-comprehend';

// Alternative - OpenAI API for tone analysis
import axios from 'axios';

class ToneAnalysisProcessor {
  private static comprehendClient: ComprehendClient;
  
  /**
   * Initialize the AWS Comprehend client
   */
  private static initClient(): ComprehendClient {
    if (!this.comprehendClient) {
      this.comprehendClient = new ComprehendClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });
    }
    return this.comprehendClient;
  }
  
  /**
   * Process transcript for tone analysis
   */
  public static async process(assetId: string, transcript?: string): Promise<{ success: boolean }> {
    const asset = await MediaAssetModel.findById(assetId);
    
    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }
    
    // Use provided transcript or get it from the asset
    const textToAnalyze = transcript || asset.transcript;
    
    if (!textToAnalyze) {
      throw new Error(`No transcript available for asset ${assetId}`);
    }
    
    try {
      // Choose analysis method based on config
      const useAWS = process.env.USE_AWS_COMPREHEND === 'true';
      const toneAnalysis = useAWS 
        ? await this.analyzeWithAWS(textToAnalyze) 
        : await this.analyzeWithOpenAI(textToAnalyze);
      
      // Update asset with tone analysis
      asset.toneAnalysis = toneAnalysis;
      await asset.save();
      
      logger.info(`Successfully analyzed tone for asset ${assetId}`);
      
      return { success: true };
    } catch (error) {
      logger.error(`Error analyzing tone for asset ${assetId}:`, error);
      
      // Don't mark asset as failed, as this is an optional step
      // Just store the error message
      if (asset.toneAnalysis) {
        asset.toneAnalysis.error = error.message;
        await asset.save();
      }
      
      throw error;
    }
  }
  
  /**
   * Analyze tone using AWS Comprehend
   */
  private static async analyzeWithAWS(text: string) {
    const client = this.initClient();
    
    // First detect language
    const languageCommand = new DetectDominantLanguageCommand({
      Text: text.substring(0, 5000) // AWS Comprehend has a 5KB limit
    });
    
    const languageResponse = await client.send(languageCommand);
    const languageCode = languageResponse.Languages?.[0]?.LanguageCode || 'en';
    
    // Then detect sentiment
    const sentimentCommand = new DetectSentimentCommand({
      Text: text.substring(0, 5000),
      LanguageCode: languageCode
    });
    
    const sentimentResponse = await client.send(sentimentCommand);
    
    return {
      sentiment: sentimentResponse.Sentiment?.toLowerCase() as 'positive' | 'negative' | 'neutral' | 'mixed',
      sentimentScore: sentimentResponse.SentimentScore,
      language: languageCode
    };
  }
  
  /**
   * Analyze tone using OpenAI API
   */
  private static async analyzeWithOpenAI(text: string) {
    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Use a smaller chunk of text if it's very large
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Analyze the tone, sentiment, and emotions in the following transcript. 
              Respond with JSON only in this format:
              {
                "sentiment": "positive|negative|neutral|mixed",
                "sentimentScore": {
                  "positive": 0.7,
                  "negative": 0.1,
                  "neutral": 0.1,
                  "mixed": 0.1
                },
                "emotions": {
                  "joy": 0.7,
                  "sadness": 0.1,
                  "anger": 0.1,
                  "fear": 0.1,
                  "surprise": 0.1
                },
                "tones": [
                  { "name": "Professional", "score": 0.8 },
                  { "name": "Formal", "score": 0.7 }
                ]
              }`
            },
            {
              role: 'user',
              content: truncatedText
            }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Parse response
      const content = response.data.choices[0].message.content;
      const analysisResult = JSON.parse(content);
      
      return analysisResult;
    } catch (error) {
      logger.error('Error analyzing tone with OpenAI:', error);
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }
}

export default ToneAnalysisProcessor;
