import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PageHeader from '@/components/Common/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChat } from '@/hooks/useChat';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { formatDistanceToNow, format } from 'date-fns';
import { MessagesSquare, MessageSquarePlus } from 'lucide-react';
import CreateChatSessionDialog from '../components/ContentGeneration/CreateChatSessionDialog';

const ChatSessionsList = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { getChatSessions } = useChat(businessId!);
  const { data, isLoading } = getChatSessions(page, 10);
  
  const contentTypeLabels: Record<string, string> = {
    'videoScript': 'Video Script',
    'metaAdCopy': 'Meta Ad Copy',
    'googleAdCopy': 'Google Ad Copy',
    'transcript': 'Transcript'
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Chat Sessions"
        description="Refine your content through interactive conversations"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat Session
          </Button>
        }
      />
      
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="archived">Archived Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : data?.sessions?.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <MessagesSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No chat sessions yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start a new chat session to refine your content through conversation
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  New Chat Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.sessions.map((session) => {
                  const latestMessage = [...session.history]
                    .filter(msg => msg.role !== 'system')
                    .pop();
                  
                  return (
                    <Card key={session.sessionId} className="overflow-hidden" data-cy="chat-session-card">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            {contentTypeLabels[session.contentType] || session.contentType}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </p>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {latestMessage ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {latestMessage.role === 'user' ? 'You' : 'AI'}:
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {latestMessage.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          {session.history.filter(msg => msg.role !== 'system').length} messages
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                          data-cy="continue-chat"
                        >
                          <Link to={`/businesses/${businessId}/chat/${session.sessionId}`}>
                            Continue
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              
              {data && data.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={data.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Archived sessions functionality coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CreateChatSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        businessId={businessId!}
      />
    </MainLayout>
  );
};

export default ChatSessionsList;
