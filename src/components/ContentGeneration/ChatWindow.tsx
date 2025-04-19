
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useMediaAsset } from '@/hooks/useMedia';
import InsightSourceBadge from '@/components/ContentGeneration/InsightSourceBadge';
import MessageInput from './ChatComponents/MessageInput';
import MediaPreview from './ChatComponents/MediaPreview';
import ChatMessage from './ChatComponents/ChatMessage';

interface ChatWindowProps {
  sessionId: string;
  onNewMessage?: (message: any) => void;
}

const ChatWindow = ({ sessionId, onNewMessage }: ChatWindowProps) => {
  const { businessId } = useParams<{ businessId: string }>();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    getChatSession,
    sendMessage,
    isSendingMessage 
  } = useChat(businessId!);

  const { data: chatSession, isLoading: isLoadingSession } = getChatSession(sessionId);
  
  const { data: mediaAsset } = useMediaAsset(
    businessId!, 
    chatSession?.mediaId ?? ''
  );

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      const response = await sendMessage({ sessionId, message: messageText });
      setMessageText('');
      if (onNewMessage) {
        onNewMessage(response);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession?.history]);

  if (isLoadingSession) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="space-y-4 mt-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chatSession) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 h-full flex flex-col justify-center items-center">
          <p className="text-muted-foreground">Chat session not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {mediaAsset && <MediaPreview mediaAsset={mediaAsset} />}

        {chatSession.insightId && (
          <div className="mb-4">
            <InsightSourceBadge 
              insightId={chatSession.insightId} 
              elementText="High-performing content from your insights"
            />
          </div>
        )}

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {chatSession.history.map((msg, index) => {
              if (msg.role === 'system' && index !== 0) return null;
              return <ChatMessage key={index} message={msg} />;
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <MessageInput
          messageText={messageText}
          onChange={setMessageText}
          onSend={handleSendMessage}
          isSending={isSendingMessage}
        />
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
