
import { useMemo } from "react";
import { GeneratedAd } from "@/interfaces/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  CopyIcon,
  DownloadIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  Share2Icon
} from "lucide-react";
import { toast } from "sonner";

interface AdPreviewProps {
  ad: GeneratedAd | null;
}

const AdPreview = ({ ad }: AdPreviewProps) => {
  const platformIcon = useMemo(() => {
    if (!ad) return null;
    
    switch (ad.platform) {
      case "facebook":
        return <FacebookIcon className="h-5 w-5" />;
      case "linkedin":
        return <LinkedinIcon className="h-5 w-5" />;
      case "tiktok":
        return <TwitterIcon className="h-5 w-5" />; // Using Twitter as a placeholder for TikTok
      default:
        return null;
    }
  }, [ad]);

  const handleCopy = () => {
    if (ad) {
      navigator.clipboard.writeText(`${ad.headline}\n\n${ad.description}\n\n${ad.callToAction}`);
      toast.success("Ad copy copied to clipboard");
    }
  };

  const handleFeedback = (positive: boolean) => {
    toast.success(`Thank you for your ${positive ? 'positive' : 'negative'} feedback!`);
  };

  if (!ad) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-6 bg-muted/30">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No ad generated yet</p>
          <p className="text-sm text-muted-foreground">
            Fill out the form and click "Generate Ad" to see a preview here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Ad Preview</CardTitle>
            <Badge variant="outline" className="ml-2">
              {ad.platform.charAt(0).toUpperCase() + ad.platform.slice(1)}
            </Badge>
          </div>
          {platformIcon}
        </div>
      </CardHeader>
      
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="flex-1 flex flex-col">
          <CardContent className="flex-1 pt-4">
            {ad.type === "image" && (
              <div className="mb-4 relative rounded-md overflow-hidden bg-muted aspect-video flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  {ad.imagePrompt ? (
                    <div className="text-center text-sm text-muted-foreground p-4">
                      <p className="font-semibold mb-1">Image based on:</p>
                      <p>{ad.imagePrompt}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Image preview</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{ad.headline}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {ad.description}
                </p>
              </div>
              
              <Button variant="outline" size="sm" className="w-auto">
                {ad.callToAction}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex-shrink-0 border-t pt-4">
            <div className="flex flex-wrap gap-2 w-full justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <CopyIcon className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleFeedback(true)}>
                  <ThumbsUpIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleFeedback(false)}>
                  <ThumbsDownIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1">
          <CardContent className="pt-4">
            <div className="bg-muted rounded-md p-4 overflow-auto max-h-80">
              <pre className="text-sm">
                {`// ${ad.platform.toUpperCase()} Ad Configuration
{
  "adType": "${ad.type}",
  "headline": "${ad.headline}",
  "description": "${ad.description}",
  "callToAction": "${ad.callToAction}"${ad.imagePrompt ? `,
  "imagePrompt": "${ad.imagePrompt}"` : ''}
}`}
              </pre>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AdPreview;
