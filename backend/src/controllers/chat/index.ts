
import { createChatSession } from './createSession.controller';
import { sendMessage } from './sendMessage.controller';
import { getChatSession, getChatSessionsForBusiness } from './getSession.controller';

export const ChatController = {
  createChatSession,
  sendMessage,
  getChatSession,
  getChatSessionsForBusiness,
};

export default ChatController;
