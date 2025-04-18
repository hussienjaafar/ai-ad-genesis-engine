
import { Types } from 'mongoose';
import ContentModel, { IContent } from '../models/Content';

export class ContentGenerationService {
  public static async generateContent(
    businessId: string,
    contentType: string,
    params: Record<string, any>
  ): Promise<IContent> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    // For now, just create a content record with the provided params
    // In the future, this would call an AI provider
    console.log('TODO: call AI provider for content generation');

    const content = new ContentModel({
      businessId,
      contentType,
      params,
      parsedContent: {
        // For now, just echo back the params with a mock response
        title: `Generated ${contentType} for your business`,
        body: `This is a placeholder for AI-generated content. Your parameters: ${JSON.stringify(params)}`,
        generatedAt: new Date().toISOString(),
      },
      status: 'completed',
      rawPrompt: JSON.stringify(params),
      rawResponse: 'Mock response - AI provider integration pending',
      metadata: {
        generationTime: Math.random() * 5, // Random generation time between 0-5 seconds
        aiModel: 'mock-model-v1',
      },
    });

    return content.save();
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
