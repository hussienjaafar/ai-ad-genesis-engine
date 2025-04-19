
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ChatService from '../services/chatService';

export class ChatController {
  /**
   * @swagger
   * /api/businesses/{id}/chat-sessions:
   *   post:
   *     summary: Create a new chat session
   *     description: Create a new chat session for refining content
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - contentType
   *             properties:
   *               contentType:
   *                 type: string
   *                 enum: [videoScript, metaAdCopy, googleAdCopy, transcript]
   *               originalContentId:
   *                 type: string
   *               mediaId:
   *                 type: string
   *               insightId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Chat session created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  public static async createChatSession(req: Request, res: Response): Promise<Response> {
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
  }

  /**
   * @swagger
   * /api/businesses/{id}/chat-sessions/{sessionId}/message:
   *   post:
   *     summary: Send a message in a chat session
   *     description: Send a message and get AI response
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - message
   *             properties:
   *               message:
   *                 type: string
   *     responses:
   *       200:
   *         description: Message sent successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Chat session not found
   *       401:
   *         description: Unauthorized
   */
  public static async sendMessage(req: Request, res: Response): Promise<Response> {
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
  }

  /**
   * @swagger
   * /api/businesses/{id}/chat-sessions/{sessionId}:
   *   get:
   *     summary: Get a chat session
   *     description: Get a chat session by ID
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Chat session retrieved successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Chat session not found
   *       401:
   *         description: Unauthorized
   */
  public static async getChatSession(req: Request, res: Response): Promise<Response> {
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
  }

  /**
   * @swagger
   * /api/businesses/{id}/chat-sessions:
   *   get:
   *     summary: Get all chat sessions for a business
   *     description: Get all chat sessions for a business with pagination
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Chat sessions retrieved successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  public static async getChatSessionsForBusiness(req: Request, res: Response): Promise<Response> {
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
  }
}

export default ChatController;
