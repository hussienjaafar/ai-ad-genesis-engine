
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdPlatform } from "@/interfaces/types";

interface ConnectPlatformDialogProps {
  platform: AdPlatform | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConnectPlatformDialog = ({ platform, isOpen, onOpenChange, onConfirm }: ConnectPlatformDialogProps) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {platform && getPlatformName(platform.name)}</DialogTitle>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm}>Connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
