
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  businessId: string;
  contentType: 'videoScript' | 'metaAdCopy' | 'googleAdCopy' | 'transcript';
  originalContentId?: string;
  mediaId?: string;
  insightId?: string;
  history: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface NewSessionParams {
  contentType: 'videoScript' | 'metaAdCopy' | 'googleAdCopy' | 'transcript';
  originalContentId?: string;
  mediaId?: string;
  insightId?: string;
}

export function useChat(businessId: string) {
  const queryClient = useQueryClient();

  // Create a new chat session
  const createChatSession = useMutation({
    mutationFn: async (params: NewSessionParams): Promise<ChatSession> => {
      const response = await api.post(`/businesses/${businessId}/chat-sessions`, params);
      return response.data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions', businessId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create chat session: ${error.response?.data?.error || 'Unknown error'}`);
    },
  });

  // Send a message in a chat session
  const sendMessage = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }): Promise<ChatMessage> => {
      const response = await api.post(
        `/businesses/${businessId}/chat-sessions/${sessionId}/message`,
        { message }
      );
      return response.data as ChatMessage;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatSession', businessId, variables.sessionId] });
    },
    onError: (error: any) => {
      toast.error(`Failed to send message: ${error.response?.data?.error || 'Unknown error'}`);
    },
  });

  // Get all chat sessions for a business
  const getChatSessions = (page = 1, limit = 10) => {
    return useQuery({
      queryKey: ['chatSessions', businessId, page, limit],
      queryFn: async () => {
        const response = await api.get(`/businesses/${businessId}/chat-sessions`, {
          params: { page, limit },
        });
        return response.data;
      },
      enabled: !!businessId,
    });
  };

  // Get a specific chat session
  const getChatSession = (sessionId: string) => {
    return useQuery({
      queryKey: ['chatSession', businessId, sessionId],
      queryFn: async () => {
        const response = await api.get(`/businesses/${businessId}/chat-sessions/${sessionId}`);
        return response.data as ChatSession;
      },
      enabled: !!businessId && !!sessionId,
      refetchInterval: (data) => {
        // If we're actively chatting, poll more frequently
        if (data && data.history && data.history.length) {
          const lastMessageTime = new Date(data.history[data.history.length - 1].timestamp).getTime();
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          return lastMessageTime > fiveMinutesAgo ? 3000 : false;
        }
        return false;
      },
    });
  };

  return {
    createChatSession: createChatSession.mutate,
    isCreatingSession: createChatSession.isPending,
    sendMessage: sendMessage.mutate,
    isSendingMessage: sendMessage.isPending,
    getChatSessions,
    getChatSession,
  };
}
