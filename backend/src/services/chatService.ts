
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import ChatSessionModel, { IChatSession, IChatMessage } from '../models/ChatSession';
import AIProvider from './aiProvider';
import BusinessModel from '../models/Business';
import ContentModel from '../models/Content';
import MediaAssetModel from '../models/MediaAsset';
import InsightService from './insightService';
import ContentGenerationService from './contentGenerationService';
import fs from 'fs';
import path from 'path';

// Load the refinement system prompt
const systemPromptTemplate = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../prompts/refinement/systemPrompt.json'), 'utf8')
);

export class ChatService {
  /**
   * Create a new chat session
   */
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

    // Create a new chat session with a unique ID
    const sessionId = uuidv4();
    
    // Initialize history with a system message
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

  /**
   * Send a message in a chat session and get AI response
   */
  public static async sendMessage(
    businessId: string,
    sessionId: string,
    message: string
  ): Promise<IChatMessage> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    // Find the chat session
    const chatSession = await ChatSessionModel.findOne({
      sessionId,
      businessId: new Types.ObjectId(businessId),
    });

    if (!chatSession) {
      throw new Error('Chat session not found');
    }

    // Add the user message to history
    const userMessage: IChatMessage = {
      role: 'user',
      message,
      timestamp: new Date(),
    };
    
    chatSession.history.push(userMessage);
    await chatSession.save();

    try {
      // Get business info for prompt context
      const business = await BusinessModel.findById(businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      // Build context based on related content
      const context = await this.buildContextForSession(chatSession);
      
      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(business.name, context);
      
      // Build conversation history for the AI
      const chatHistory = chatSession.history
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.message
        }));
      
      // Generate AI response
      const aiResponse = await AIProvider.generateCompletion(
        systemPrompt,
        JSON.stringify(chatHistory),
        businessId
      );

      // Add the AI response to history
      const assistantMessage: IChatMessage = {
        role: 'assistant',
        message: aiResponse,
        timestamp: new Date(),
      };
      
      chatSession.history.push(assistantMessage);
      await chatSession.save();

      // Update content revision if this session is related to content
      if (chatSession.originalContentId) {
        await ContentGenerationService.addContentRevision(
          chatSession.originalContentId.toString(),
          assistantMessage.message,
          sessionId
        );
      }

      return assistantMessage;
    } catch (error) {
      // Add error message to history
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

  /**
   * Get chat session by ID
   */
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

  /**
   * Get all chat sessions for a business
   */
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

  /**
   * Build context for the AI based on session related content
   */
  private static async buildContextForSession(chatSession: IChatSession): Promise<string> {
    let context = '';

    // Add media context if available
    if (chatSession.mediaId) {
      const media = await MediaAssetModel.findById(chatSession.mediaId);
      if (media) {
        context += '### MEDIA CONTEXT:\n';
        
        if (media.assetType === 'video' && media.transcript) {
          context += `Video Transcript: ${media.transcript}\n`;
        }
        
        if (media.detectedText && media.detectedText.length > 0) {
          context += `Detected Text: ${media.detectedText.join(' ')}\n`;
        }
        
        if (media.labels && media.labels.length > 0) {
          context += `Visual Elements: ${media.labels.map((label: any) => 
            `${label.name} (${Math.round(label.confidence * 100)}%)`).join(', ')}\n`;
        }
        
        if (media.toneAnalysis) {
          context += 'Tone Analysis: ';
          for (const [tone, score] of Object.entries(media.toneAnalysis)) {
            context += `${tone}: ${score}, `;
          }
          context = context.slice(0, -2) + '\n';
        }
      }
    }

    // Add insight context if available
    if (chatSession.insightId) {
      try {
        const elementSnippet = await InsightService.getElementSnippet(chatSession.insightId.toString());
        if (elementSnippet) {
          context += '### PERFORMANCE INSIGHT CONTEXT:\n';
          context += `High-Performing Element: "${elementSnippet}"\n`;
          // TODO: Add performance stats if available
        }
      } catch (error) {
        console.error('Error fetching insight data:', error);
      }
    }

    // Add original content if available
    if (chatSession.originalContentId) {
      const content = await ContentModel.findById(chatSession.originalContentId);
      if (content) {
        context += '### ORIGINAL CONTENT:\n';
        context += `Content Type: ${content.contentType}\n`;
        context += `Content: ${JSON.stringify(content.parsedContent)}\n`;
      }
    }

    return context;
  }

  /**
   * Build the system prompt for the AI
   */
  private static buildSystemPrompt(businessName: string, context: string): string {
    const { refinementMode } = systemPromptTemplate;
    
    let systemPrompt = `${refinementMode.instructions}\n\n`;
    systemPrompt += `Business Name: ${businessName}\n\n`;
    
    systemPrompt += 'REFINEMENT GUIDELINES:\n';
    refinementMode.refinementGuidelines.forEach((guideline: string, index: number) => {
      systemPrompt += `${index + 1}. ${guideline}\n`;
    });
    systemPrompt += '\n';
    
    systemPrompt += 'RESPONSE GUIDELINES:\n';
    refinementMode.responseGuidelines.forEach((guideline: string, index: number) => {
      systemPrompt += `${index + 1}. ${guideline}\n`;
    });
    systemPrompt += '\n';
    
    // Add context if available
    if (context) {
      systemPrompt += 'CONTEXT:\n' + context + '\n';
    }
    
    return systemPrompt;
  }
}

export default ChatService;
