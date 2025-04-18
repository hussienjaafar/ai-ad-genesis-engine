
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentForm } from "@/components/ContentGeneration/ContentForm";
import { ContentDisplay } from "@/components/ContentGeneration/ContentDisplay";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useAuth } from "@/hooks/useAuth";

interface GeneratedContentState {
  contentId: string;
  contentType: string;
  parsedContent: Record<string, any>;
}

export default function GenerateContent() {
  const { id } = useParams<{ id: string }>();
  const businessId = id || "";
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentState | null>(null);
  const { user } = useAuth();
  const { getBusiness } = useBusinesses();
  
  const { data: businessData, isLoading } = getBusiness(businessId);

  const handleContentGenerated = (content: any) => {
    if (content && content.parsedContent) {
      setGeneratedContent({
        contentId: content.contentId,
        contentType: content.contentType || 'facebook', // Default to facebook if not specified
        parsedContent: content.parsedContent
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading business data...</p>
        </div>
      </MainLayout>
    );
  }

  if (!businessData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Business not found or you don't have access.</p>
        </div>
      </MainLayout>
    );
  }

  const offerings = businessData.offerings || [];
  
  if (offerings.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold mb-2">No Offerings Available</h2>
          <p className="text-muted-foreground">
            You need to add offerings to this business before you can generate content.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Content</h1>
          <p className="text-muted-foreground">
            Create marketing content for {businessData.name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Content</CardTitle>
              <CardDescription>
                Select your parameters and generate professional marketing content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentForm 
                businessId={businessId}
                offerings={offerings}
                onContentGenerated={handleContentGenerated}
              />
            </CardContent>
          </Card>

          {generatedContent && (
            <ContentDisplay 
              contentType={generatedContent.contentType}
              content={generatedContent.parsedContent}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
