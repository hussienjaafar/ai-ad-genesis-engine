
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useMediaAsset } from '@/hooks/useMedia';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import InsightSourceBadge from '@/components/ContentGeneration/InsightSourceBadge';

interface ChatWindowProps {
  sessionId: string;
  onNewMessage?: (message: ChatMessage) => void;
}

const ChatWindow = ({ sessionId, onNewMessage }: ChatWindowProps) => {
  const { businessId } = useParams<{ businessId: string }>();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { 
    getChatSession,
    sendMessage,
    isSendingMessage 
  } = useChat(businessId!);

  const { data: chatSession, isLoading: isLoadingSession } = getChatSession(sessionId);
  
  // If the chat session has a media ID, fetch the media
  const { data: mediaAsset } = useMediaAsset(
    businessId!,
    chatSession?.mediaId as string, 
    { enabled: !!chatSession?.mediaId }
  );

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      const response = await sendMessage({ sessionId, message: messageText });
      setMessageText('');
      if (onNewMessage && response) {
        onNewMessage(response);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);
  
  // Scroll to bottom when new messages arrive
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
        {/* Media Context (if available) */}
        {mediaAsset && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <div className="flex items-start gap-3">
              {mediaAsset.assetType === 'image' && mediaAsset.url && (
                <img 
                  src={mediaAsset.url} 
                  alt={mediaAsset.metadata.name || 'Media asset'} 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              {mediaAsset.assetType === 'video' && mediaAsset.metadata.thumbnailUrl && (
                <div className="relative w-16 h-16">
                  <img 
                    src={mediaAsset.metadata.thumbnailUrl} 
                    alt={mediaAsset.metadata.name || 'Video thumbnail'} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                    <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                      <div className="w-0 h-0 border-y-6 border-y-transparent border-l-8 border-l-black ml-1" />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium">
                    {mediaAsset.metadata.name || `${mediaAsset.assetType} asset`}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {mediaAsset.platform}
                  </Badge>
                </div>
                {mediaAsset.transcript && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {mediaAsset.transcript.substring(0, 100)}
                    {mediaAsset.transcript.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insight Context (if available) */}
        {chatSession.insightId && (
          <div className="mb-4">
            <InsightSourceBadge 
              insightId={chatSession.insightId as string} 
              elementText="High-performing content from your insights"
            />
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {chatSession.history.map((msg, index) => {
              // Skip system messages except the first one
              if (msg.role === 'system' && index !== 0) return null;
              
              return (
                <div key={index} className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : ''
                }`}>
                  {msg.role !== 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {msg.role === 'system' ? 'SYS' : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : msg.role === 'system' 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-accent'
                  } rounded-lg p-3`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                    <div className="mt-1 text-xs opacity-70">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="mt-4 flex gap-2">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isSendingMessage}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSendingMessage || !messageText.trim()} 
            className="self-end"
          >
            {isSendingMessage ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
