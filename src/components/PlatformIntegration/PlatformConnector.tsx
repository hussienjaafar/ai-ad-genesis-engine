import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAdPlatforms } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExternalLinkIcon, FacebookIcon, ChromeIcon, LinkedinIcon, TwitterIcon, CheckCircleIcon } from "lucide-react";
import { AdPlatform } from "@/interfaces/types";

interface PlatformConnectorProps {
  onConnected: (platform: AdPlatform) => void;
  minimal?: boolean;
}

const PlatformConnector = ({ onConnected, minimal = false }: PlatformConnectorProps) => {
  const [platforms, setPlatforms] = useState(mockAdPlatforms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<AdPlatform | null>(null);

  const handleConnect = (platform: AdPlatform) => {
    setCurrentPlatform(platform);
    setIsDialogOpen(true);
  };

  const handleConnectConfirm = () => {
    if (currentPlatform) {
      const updatedPlatforms = platforms.map(p => 
        p.id === currentPlatform.id ? { ...p, isConnected: true, lastSynced: new Date().toISOString() } : p
      );
      
      setPlatforms(updatedPlatforms);
      onConnected({
        ...currentPlatform,
        isConnected: true,
        lastSynced: new Date().toISOString()
      });
      
      toast.success(`${getPlatformName(currentPlatform.name)} connected successfully!`);
      setIsDialogOpen(false);
    }
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case "facebook":
        return <FacebookIcon className="h-6 w-6" />;
      case "google":
        return <ChromeIcon className="h-6 w-6" />;
      case "linkedin":
        return <LinkedinIcon className="h-6 w-6" />;
      case "tiktok":
        return <TwitterIcon className="h-6 w-6" />; // Using Twitter as placeholder for TikTok
      default:
        return null;
    }
  };

  const getPlatformName = (platformCode: string) => {
    switch (platformCode) {
      case "facebook":
        return "Facebook Ads";
      case "google":
        return "Google Ads";
      case "linkedin":
        return "LinkedIn Ads";
      case "tiktok":
        return "TikTok Ads";
      default:
        return platformCode;
    }
  };

  const getPlatformDescription = (platformCode: string) => {
    switch (platformCode) {
      case "facebook":
        return "Connect to Facebook Ads to analyze campaigns and generate optimized ad content.";
      case "google":
        return "Connect to Google Ads to analyze search campaigns and generate optimized ad content.";
      case "linkedin":
        return "Connect to LinkedIn Ads for B2B campaign analysis and ad generation.";
      case "tiktok":
        return "Connect to TikTok Ads for video ad performance analysis and content generation.";
      default:
        return "";
    }
  };

  if (minimal) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.slice(0, 2).map((platform) => (
          <Card key={platform.id} className={`${platform.isConnected ? 'border-success-500' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(platform.name)}
                  <CardTitle className="text-lg">{getPlatformName(platform.name)}</CardTitle>
                </div>
                {platform.isConnected && (
                  <CheckCircleIcon className="h-5 w-5 text-success-600" />
                )}
              </div>
            </CardHeader>
            <CardFooter className="pt-2">
              {!platform.isConnected ? (
                <Button 
                  onClick={() => handleConnect(platform)}
                  className="w-full"
                  variant="outline"
                >
                  Connect
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Connected
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {currentPlatform && getPlatformName(currentPlatform.name)}</DialogTitle>
              <DialogDescription>
                Enter your API credentials to connect your account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-id">Account ID</Label>
                <Input id="account-id" placeholder="Enter account ID" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter API key" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConnectConfirm}>Connect</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id} className={`${platform.isConnected ? 'border-success-500' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(platform.name)}
                  <CardTitle>{getPlatformName(platform.name)}</CardTitle>
                </div>
                {platform.isConnected && (
                  <CheckCircleIcon className="h-5 w-5 text-success-600" />
                )}
              </div>
              <CardDescription>
                {getPlatformDescription(platform.name)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {platform.isConnected && (
                <div className="text-sm">
                  <p className="font-medium">Last synced:</p>
                  <p className="text-muted-foreground">{new Date(platform.lastSynced!).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!platform.isConnected ? (
                <Button 
                  onClick={() => handleConnect(platform)}
                  className="w-full"
                >
                  Connect <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline"
                    className="flex-1"
                  >
                    View Data
                  </Button>
                  <Button 
                    variant="secondary"
                    className="flex-1"
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {currentPlatform && getPlatformName(currentPlatform.name)}</DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account-id">Account ID</Label>
              <Input id="account-id" placeholder="Enter account ID" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Enter API key" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConnectConfirm}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlatformConnector;
