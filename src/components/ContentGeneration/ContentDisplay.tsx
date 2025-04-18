
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface ContentDisplayProps {
  contentType: string;
  content: Record<string, any>;
}

export function ContentDisplay({ contentType, content }: ContentDisplayProps) {
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFields((prev) => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopiedFields((prev) => ({ ...prev, [field]: false }));
      }, 2000);
    });
  };

  const renderFacebookContent = () => {
    if (!content) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Headline</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.headline, 'headline')}
            >
              {copiedFields['headline'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-lg font-semibold border p-3 rounded-md">{content.headline}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Primary Text</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.primaryText, 'primaryText')}
            >
              {copiedFields['primaryText'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="border p-3 rounded-md">{content.primaryText}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Call to Action</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.callToAction, 'callToAction')}
            >
              {copiedFields['callToAction'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="border p-3 rounded-md">{content.callToAction}</p>
        </div>
      </div>
    );
  };

  const renderGoogleContent = () => {
    if (!content) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Headlines</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.headlines.join('\n'), 'headlines')}
            >
              {copiedFields['headlines'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="border p-3 rounded-md">
            {content.headlines.map((headline: string, index: number) => (
              <p key={index} className="mb-1 font-semibold">{headline}</p>
            ))}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Descriptions</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.descriptions.join('\n'), 'descriptions')}
            >
              {copiedFields['descriptions'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="border p-3 rounded-md">
            {content.descriptions.map((description: string, index: number) => (
              <p key={index} className="mb-1">{description}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVideoScriptContent = () => {
    if (!content) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Title</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.title, 'title')}
            >
              {copiedFields['title'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-lg font-semibold border p-3 rounded-md">{content.title}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Introduction</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.intro, 'intro')}
            >
              {copiedFields['intro'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="border p-3 rounded-md">{content.intro}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Main Content</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.mainContent, 'mainContent')}
            >
              {copiedFields['mainContent'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="border p-3 rounded-md">{content.mainContent}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium">Call to Action</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(content.callToAction, 'callToAction')}
            >
              {copiedFields['callToAction'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="border p-3 rounded-md">{content.callToAction}</p>
        </div>
        
        {content.visualNotes && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Visual Notes</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(content.visualNotes, 'visualNotes')}
              >
                {copiedFields['visualNotes'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="border p-3 rounded-md">{content.visualNotes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (contentType) {
      case 'facebook':
        return renderFacebookContent();
      case 'google':
        return renderGoogleContent();
      case 'videoScript':
        return renderVideoScriptContent();
      default:
        return <p>Unsupported content type</p>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
        <CardDescription>
          {contentType === 'facebook' && 'Facebook Ad content ready to use on your campaigns'}
          {contentType === 'google' && 'Google Ad content formatted for your campaigns'}
          {contentType === 'videoScript' && '30-second video script for your marketing videos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={() => copyToClipboard(JSON.stringify(content, null, 2), 'all')}
          variant="outline"
        >
          {copiedFields['all'] ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          Copy All
        </Button>
      </CardFooter>
    </Card>
  );
}
