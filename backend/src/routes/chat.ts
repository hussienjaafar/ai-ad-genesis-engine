
import express from 'express';
import ChatController from '../controllers/chatController';
import authorize from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat session management endpoints
 */

// Create a new chat session
router.post('/:id/chat-sessions', authorize, ChatController.createChatSession);

// Send a message in a chat session
router.post('/:id/chat-sessions/:sessionId/message', authorize, ChatController.sendMessage);

// Get a chat session
router.get('/:id/chat-sessions/:sessionId', authorize, ChatController.getChatSession);

// Get all chat sessions for a business
router.get('/:id/chat-sessions', authorize, ChatController.getChatSessionsForBusiness);

export default router;
