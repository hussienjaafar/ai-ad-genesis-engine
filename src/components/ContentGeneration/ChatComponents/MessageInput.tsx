
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  messageText: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
}

const MessageInput = ({ messageText, onChange, onSend, isSending }: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="mt-4 flex gap-2">
      <Textarea
        ref={textareaRef}
        value={messageText}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="min-h-[60px] resize-none"
        disabled={isSending}
      />
      <Button 
        onClick={onSend} 
        disabled={isSending || !messageText.trim()} 
        className="self-end"
      >
        {isSending ? 
          <Loader2 className="h-4 w-4 animate-spin" /> : 
          <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default MessageInput;
