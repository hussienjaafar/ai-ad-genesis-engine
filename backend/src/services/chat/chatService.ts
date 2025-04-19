
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import ChatSessionModel, { IChatSession, IChatMessage } from '../../models/ChatSession';
import AIProvider from '../aiProvider';
import BusinessModel from '../../models/Business';
import ContentGenerationService from '../contentGenerationService';
import PromptService from './promptService';
import ContextBuilder from './contextBuilder';

export class ChatService {
  public static async createChatSession(
    businessId: string,
    contentType: 'videoScript' | 'metaAdCopy' | 'googleAdCopy' | 'transcript',
    originalContentId?: string,
    mediaId?: string,
    insightId?: string
  ): Promise<IChatSession> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    // Validate IDs if provided
    if (originalContentId && !Types.ObjectId.isValid(originalContentId)) {
      throw new Error('Invalid content ID');
    }
    if (mediaId && !Types.ObjectId.isValid(mediaId)) {
      throw new Error('Invalid media ID');
    }
    if (insightId && !Types.ObjectId.isValid(insightId)) {
      throw new Error('Invalid insight ID');
    }

    const sessionId = uuidv4();
    
    const initialSystemMessage: IChatMessage = {
      role: 'system',
      message: 'Chat session started. You can now refine your content by sending messages.',
      timestamp: new Date(),
    };

    const chatSession = new ChatSessionModel({
      sessionId,
      businessId: new Types.ObjectId(businessId),
      contentType,
      originalContentId: originalContentId ? new Types.ObjectId(originalContentId) : undefined,
      mediaId: mediaId ? new Types.ObjectId(mediaId) : undefined,
      insightId: insightId ? new Types.ObjectId(insightId) : undefined,
      history: [initialSystemMessage],
    });

    return await chatSession.save();
  }

  public static async sendMessage(
    businessId: string,
    sessionId: string,
    message: string
  ): Promise<IChatMessage> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    const chatSession = await ChatSessionModel.findOne({
      sessionId,
      businessId: new Types.ObjectId(businessId),
    });

    if (!chatSession) {
      throw new Error('Chat session not found');
    }

    const userMessage: IChatMessage = {
      role: 'user',
      message,
      timestamp: new Date(),
    };
    
    chatSession.history.push(userMessage);
    await chatSession.save();

    try {
      const business = await BusinessModel.findById(businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      const context = await ContextBuilder.buildContextForSession(chatSession);
      const systemPrompt = PromptService.buildSystemPrompt(business.name, context);
      
      const chatHistory = chatSession.history
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.message
        }));
      
      const aiResponse = await AIProvider.generateCompletion(
        systemPrompt,
        JSON.stringify(chatHistory),
        businessId
      );

      const assistantMessage: IChatMessage = {
        role: 'assistant',
        message: aiResponse,
        timestamp: new Date(),
      };
      
      chatSession.history.push(assistantMessage);
      await chatSession.save();

      if (chatSession.originalContentId) {
        await ContentGenerationService.addContentRevision(
          chatSession.originalContentId.toString(),
          assistantMessage.message,
          sessionId
        );
      }

      return assistantMessage;
    } catch (error) {
      const errorMessage: IChatMessage = {
        role: 'system',
        message: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`,
        timestamp: new Date(),
      };
      
      chatSession.history.push(errorMessage);
      await chatSession.save();
      
      throw error;
    }
  }

  public static async getChatSession(
    businessId: string,
    sessionId: string
  ): Promise<IChatSession> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    const chatSession = await ChatSessionModel.findOne({
      sessionId,
      businessId: new Types.ObjectId(businessId),
    });

    if (!chatSession) {
      throw new Error('Chat session not found');
    }

    return chatSession;
  }

  public static async getChatSessionsForBusiness(
    businessId: string,
    limit = 10,
    page = 1
  ): Promise<{ sessions: IChatSession[]; total: number; pages: number }> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    const skip = (page - 1) * limit;
    
    const [sessions, total] = await Promise.all([
      ChatSessionModel.find({ businessId: new Types.ObjectId(businessId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ChatSessionModel.countDocuments({ businessId: new Types.ObjectId(businessId) }),
    ]);

    return {
      sessions,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export default ChatService;
