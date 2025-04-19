
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PageHeader from '@/components/Common/PageHeader';
import ChatWindow from '@/components/ContentGeneration/ChatWindow';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatPage = () => {
  const { businessId, sessionId } = useParams<{ businessId: string; sessionId: string }>();
  const { getChatSession } = useChat(businessId!);
  const { data: chatSession } = getChatSession(sessionId!);

  const contentTypeLabels: Record<string, string> = {
    'videoScript': 'Video Script',
    'metaAdCopy': 'Meta Ad Copy',
    'googleAdCopy': 'Google Ad Copy',
    'transcript': 'Transcript'
  };

  return (
    <MainLayout>
      <PageHeader
        title={chatSession 
          ? `${contentTypeLabels[chatSession.contentType] || chatSession.contentType} Refinement`
          : 'Chat Session'
        }
        description="Refine your content through conversation"
        actions={
          <Button variant="outline" asChild>
            <Link to={`/businesses/${businessId}/chat`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Link>
          </Button>
        }
      />
      
      <div className="h-[calc(100vh-200px)]">
        <ChatWindow sessionId={sessionId!} />
      </div>
    </MainLayout>
  );
};

export default ChatPage;
