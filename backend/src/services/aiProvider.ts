
import axios from 'axios';

export class AIProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.AI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.MAX_TOKENS || '8000');
    
    if (!this.apiKey) {
      console.warn('OPENAI_API_KEY not set, AI generation will fail');
    }
  }

  async generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const totalPromptTokens = this.estimateTokenCount(systemPrompt + userPrompt);
      
      if (totalPromptTokens > this.maxTokens) {
        throw new Error(`Prompt exceeds token limit of ${this.maxTokens}`);
      }

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
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      if (error.response?.status === 413 || error.message.includes('token limit')) {
        throw new Error('Prompt exceeds token limit');
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
