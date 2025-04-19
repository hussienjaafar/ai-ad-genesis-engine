
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ChatService from '../../services/chat/chatService';

export const sendMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id: businessId, sessionId } = req.params;
    const { message } = req.body;

    if (!Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ error: 'Invalid business ID' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      const response = await ChatService.sendMessage(
        businessId,
        sessionId,
        message
      );

      return res.json(response);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message.includes('quota exceeded')) {
        return res.status(429).json({ error: 'Monthly token quota exceeded' });
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Message sending error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
