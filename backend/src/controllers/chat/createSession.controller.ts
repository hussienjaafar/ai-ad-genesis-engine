
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ChatService from '../../services/chat/chatService';

export const createChatSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: businessId } = req.params;
    const { contentType, originalContentId, mediaId, insightId } = req.body;

    if (!Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ error: 'Invalid business ID' });
    }

    if (!contentType) {
      return res.status(400).json({ error: 'Content type is required' });
    }

    const validContentTypes = ['videoScript', 'metaAdCopy', 'googleAdCopy', 'transcript'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({ 
        error: `Invalid content type. Must be one of: ${validContentTypes.join(', ')}` 
      });
    }

    try {
      const chatSession = await ChatService.createChatSession(
        businessId,
        contentType,
        originalContentId,
        mediaId,
        insightId
      );

      return res.status(201).json({
        sessionId: chatSession.sessionId,
        contentType: chatSession.contentType,
        history: chatSession.history,
        createdAt: chatSession.createdAt
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Chat session creation error:', error);
    return res.status(500).json({ error: 'Failed to create chat session' });
  }
};
