
import { IBusiness } from '../models/Business';

export class AIPromptEngine {
  public static buildSystemPrompt(business: IBusiness, contentType: string): string {
    const basePrompt = `
You are an expert AI marketing assistant for ${business.name}.

Business Information:
- Industry: ${business.industry || 'Not specified'}
- Description: ${business.description || 'Not specified'}
- Offerings: ${business.offerings?.join(', ') || 'Not specified'}

Your task is to generate professional, engaging, and conversion-focused marketing content based on the provided parameters.
`;

    // Add content type specific instructions
    switch (contentType) {
      case 'facebook':
        return basePrompt + `
For Facebook Ads:
- Create compelling ad copy that is concise and focused on benefits
- Include a clear call-to-action
- Keep headlines under 40 characters and primary text under 125 characters
- Maintain a conversational tone that aligns with Facebook's platform
- Format the response as JSON with: headline, primaryText, and callToAction fields
`;

      case 'google':
        return basePrompt + `
For Google Ads:
- Create compelling headlines (max 30 characters each) and descriptions (max 90 characters each)
- Include specific keywords where appropriate
- Focus on clear value proposition and call-to-action
- Format the response as JSON with: headlines (array of 3), descriptions (array of 2)
`;

      case 'videoScript':
        return basePrompt + `
For Video Script:
- Create a 30-second video script with clear sections for narration and visuals
- Include an attention-grabbing opening, key benefits, and strong call-to-action
- Keep the script conversational and engaging
- Aim for approximately 70-80 words for a 30-second video
- Format the response as JSON with: title, intro, mainContent, callToAction, and visualNotes fields
`;

      default:
        return basePrompt + `
Please create marketing content that is professional, engaging and tailored to the business information provided.
Format your response as structured JSON that represents the appropriate content pieces.
`;
    }
  }
}

export default AIPromptEngine;
