
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ChatService from '../../services/chat/chatService';

export const getChatSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: businessId, sessionId } = req.params;

    if (!Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ error: 'Invalid business ID' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
      const chatSession = await ChatService.getChatSession(businessId, sessionId);
      return res.json(chatSession);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Get chat session error:', error);
    return res.status(500).json({ error: 'Failed to get chat session' });
  }
};

export const getChatSessionsForBusiness = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: businessId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ error: 'Invalid business ID' });
    }

    const result = await ChatService.getChatSessionsForBusiness(businessId, limit, page);

    return res.json(result);
  } catch (error: any) {
    console.error('Get chat sessions error:', error);
    return res.status(500).json({ error: 'Failed to get chat sessions' });
  }
};
