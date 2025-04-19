import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useChat } from '@/hooks/useChat';
import { Loader2 } from 'lucide-react';

interface CreateChatSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
}

const CreateChatSessionDialog = ({
  open,
  onOpenChange,
  businessId,
}: CreateChatSessionDialogProps) => {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<'videoScript' | 'metaAdCopy' | 'googleAdCopy' | 'transcript'>('videoScript');
  
  const { createChatSession, isCreatingSession } = useChat(businessId);
  
  const handleCreate = async () => {
    try {
      const session = await createChatSession({
        contentType,
      });
      
      onOpenChange(false);
      navigate(`/businesses/${businessId}/chat/${session.sessionId}`);
    } catch (error) {
      console.error('Failed to create chat session', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat Session</DialogTitle>
          <DialogDescription>
            Create a new chat session to refine your marketing content
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label className="mb-2 block">Content Type</Label>
          <RadioGroup
            value={contentType}
            onValueChange={(value) => 
              setContentType(value as 'videoScript' | 'metaAdCopy' | 'googleAdCopy' | 'transcript')
            }
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="videoScript" id="videoScript" />
              <Label htmlFor="videoScript">Video Script</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="metaAdCopy" id="metaAdCopy" />
              <Label htmlFor="metaAdCopy">Meta Ad Copy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="googleAdCopy" id="googleAdCopy" />
              <Label htmlFor="googleAdCopy">Google Ad Copy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transcript" id="transcript" />
              <Label htmlFor="transcript">Transcript</Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isCreatingSession} onClick={handleCreate}>
            {isCreatingSession && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatSessionDialog;
