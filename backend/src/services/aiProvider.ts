
import axios from 'axios';
import UsageService from './usageService';
import * as redis from '../lib/redis';

// Define lock key prefix for atomic quota operations
const QUOTA_LOCK_PREFIX = 'quota_lock:';

export class AIProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private requestTimeout: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.AI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.MAX_TOKENS || '8000');
    this.requestTimeout = 30000; // 30 seconds timeout for API calls
    
    if (!this.apiKey) {
      console.warn('OPENAI_API_KEY not set, AI generation will fail');
    }
  }

  async generateCompletion(systemPrompt: string, userPrompt: string, businessId?: string): Promise<string> {
    try {
      const totalPromptTokens = this.estimateTokenCount(systemPrompt + userPrompt);
      
      if (totalPromptTokens > this.maxTokens) {
        throw new Error(`Prompt exceeds token limit of ${this.maxTokens}`);
      }

      let quotaLockKey: string | null = null;
      let quotaReleased = false;

      // If businessId is provided, check quota before proceeding with atomic lock
      if (businessId) {
        // Create a unique lock key for this business
        quotaLockKey = `${QUOTA_LOCK_PREFIX}${businessId}`;
        
        try {
          // Try to acquire a lock for quota check
          await redis.setWithExpiry(quotaLockKey, 'locked', 10); // 10 second lock
          
          const quotaCheck = await UsageService.checkQuota(businessId);
          
          // Check if 90% threshold reached and trigger warning
          if (quotaCheck.used >= quotaCheck.limit * 0.9) {
            console.warn(`Business ${businessId} has reached 90% of its token quota`);
            await UsageService.markQuotaNearlyReached(businessId);
          }
          
          if (!quotaCheck.hasQuota) {
            await redis.del(quotaLockKey);
            quotaReleased = true;
            throw new Error('Monthly token quota exceeded. Please upgrade your plan to continue.');
          }
          
          // Pre-reserve estimated tokens to prevent race conditions
          await UsageService.reserveTokens(businessId, totalPromptTokens);
        } catch (error) {
          if (!quotaReleased && quotaLockKey) {
            await redis.del(quotaLockKey);
          }
          throw error;
        }
      }

      // Make the API call with a timeout
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: this.requestTimeout, // Set timeout for the request
        }
      );

      const completionText = response.data.choices[0].message.content;
      const completionTokens = this.estimateTokenCount(completionText);

      // Record token usage if businessId is provided
      if (businessId) {
        await UsageService.recordUsage(
          businessId,
          totalPromptTokens,
          completionTokens
        );
        
        // Release lock after recording usage
        if (quotaLockKey) {
          await redis.del(quotaLockKey);
        }
      }

      return completionText;
    } catch (error: any) {
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('The AI service took too long to respond. Please try again later.');
      }
      
      if (error.response?.status === 413 || error.message.includes('token limit')) {
        throw new Error('Prompt exceeds token limit');
      }
      
      // Check if it's a quota error and format accordingly
      if (error.message.includes('quota exceeded')) {
        const quotaError = new Error('Monthly token quota exceeded');
        (quotaError as any).status = 429; // Too Many Requests
        throw quotaError;
      }
      
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  // Crude token estimation (1 token ≈ 4 chars for English text)
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

export default new AIProvider();
