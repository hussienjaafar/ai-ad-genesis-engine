
import { Types } from 'mongoose';
import ContentModel, { IContent } from '../models/Content';
import BusinessModel from '../models/Business';
import AIPromptEngine from './aiPromptEngine';
import AIProvider from './aiProvider';

export class ContentGenerationService {
  public static async generateContent(
    businessId: string,
    contentType: string,
    params: Record<string, any>
  ): Promise<IContent> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    // Get business information
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Build system and user prompts
    const systemPrompt = AIPromptEngine.buildSystemPrompt(business, contentType);
    const userPrompt = this.buildUserPrompt(contentType, params);

    try {
      // Generate content using AI provider
      const rawResponse = await AIProvider.generateCompletion(systemPrompt, userPrompt);
      
      // Parse the response based on content type
      const parsedContent = this.parseResponse(contentType, rawResponse);
      
      // Create and save content record
      const content = new ContentModel({
        businessId,
        contentType,
        params,
        parsedContent,
        status: 'completed',
        rawPrompt: JSON.stringify({ systemPrompt, userPrompt }),
        rawResponse,
        metadata: {
          generationTime: new Date().getTime(),
          aiModel: process.env.AI_MODEL || 'gpt-4o',
        },
      });

      return content.save();
    } catch (error: any) {
      if (error.message.includes('token limit')) {
        throw new Error('Content generation failed: Prompt exceeds token limit');
      }
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  private static buildUserPrompt(contentType: string, params: Record<string, any>): string {
    const basePrompt = `Please create ${contentType} content with the following parameters:\n`;
    return basePrompt + JSON.stringify(params, null, 2);
  }

  private static parseResponse(contentType: string, response: string): Record<string, any> {
    try {
      // First try to parse as JSON
      try {
        return JSON.parse(response);
      } catch (e) {
        // If not valid JSON, use content type specific parsers
        switch (contentType) {
          case 'facebook':
            return this.parseFacebookResponse(response);
          case 'google':
            return this.parseGoogleResponse(response);
          case 'videoScript':
            return this.parseVideoScriptResponse(response);
          default:
            // Generic parsing - return as-is with a text field
            return { text: response };
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { text: response, parsingError: true };
    }
  }

  private static parseFacebookResponse(response: string): Record<string, any> {
    // Simple regex-based parsing for Facebook ad content
    const headlineMatch = response.match(/headline[:\s]+["']?([^"'\n]+)["']?/i);
    const primaryTextMatch = response.match(/primary text[:\s]+["']?([^"'\n]+)["']?/i);
    const ctaMatch = response.match(/call to action[:\s]+["']?([^"'\n]+)["']?/i);

    return {
      headline: headlineMatch?.[1] || 'Untitled Ad',
      primaryText: primaryTextMatch?.[1] || response,
      callToAction: ctaMatch?.[1] || 'Learn More',
    };
  }

  private static parseGoogleResponse(response: string): Record<string, any> {
    // Parse Google Ads format
    const headlines: string[] = [];
    const descriptions: string[] = [];

    // Extract headlines
    const headlineMatches = response.matchAll(/headline\s\d+[:\s]+["']?([^"'\n]+)["']?/gi);
    for (const match of headlineMatches) {
      if (match[1]) headlines.push(match[1]);
    }

    // Extract descriptions
    const descriptionMatches = response.matchAll(/description\s\d+[:\s]+["']?([^"'\n]+)["']?/gi);
    for (const match of descriptionMatches) {
      if (match[1]) descriptions.push(match[1]);
    }

    return {
      headlines: headlines.length > 0 ? headlines : ['Untitled Ad'],
      descriptions: descriptions.length > 0 ? descriptions : [response],
    };
  }

  private static parseVideoScriptResponse(response: string): Record<string, any> {
    // Parse video script format
    const titleMatch = response.match(/title[:\s]+["']?([^"'\n]+)["']?/i);
    const introMatch = response.match(/intro[:\s]+["']?([^"'\n]+)["']?/i);
    const mainContentMatch = response.match(/main content[:\s]+["']?([^"'\n]+)["']?/i);
    const ctaMatch = response.match(/call to action[:\s]+["']?([^"'\n]+)["']?/i);
    const visualNotesMatch = response.match(/visual notes[:\s]+["']?([^"'\n]+)["']?/i);

    return {
      title: titleMatch?.[1] || 'Untitled Video',
      intro: introMatch?.[1] || '',
      mainContent: mainContentMatch?.[1] || response,
      callToAction: ctaMatch?.[1] || 'Learn More',
      visualNotes: visualNotesMatch?.[1] || '',
    };
  }

  public static async getContentForBusiness(
    businessId: string,
    contentType?: string,
    limit = 10,
    page = 1
  ): Promise<{ content: IContent[]; total: number; pages: number }> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    const skip = (page - 1) * limit;
    
    const query: any = { businessId, isDeleted: false };
    if (contentType) {
      query.contentType = contentType;
    }

    const [content, total] = await Promise.all([
      ContentModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ContentModel.countDocuments(query),
    ]);

    return {
      content,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  public static async getContentById(id: string): Promise<IContent | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid content ID');
    }
    
    return ContentModel.findOne({ _id: id, isDeleted: false });
  }
}

export default ContentGenerationService;
