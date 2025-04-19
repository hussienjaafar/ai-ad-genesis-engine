
import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${
      message.role === 'user' ? 'justify-end' : ''
    }`}>
      {message.role !== 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {message.role === 'system' ? 'SYS' : 'AI'}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[80%] ${
        message.role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : message.role === 'system' 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-accent'
      } rounded-lg p-3`}>
        <div className="text-sm whitespace-pre-wrap">{message.message}</div>
        <div className="mt-1 text-xs opacity-70">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </div>
      </div>
      {message.role === 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
