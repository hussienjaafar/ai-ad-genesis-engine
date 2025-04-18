
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ExternalLinkIcon } from "lucide-react";
import { AdPlatform } from "@/interfaces/types";
import { PlatformIcon } from "./PlatformIcon";
import { getPlatformName, getPlatformDescription } from "@/utils/platformUtils";

interface PlatformCardProps {
  platform: AdPlatform;
  minimal?: boolean;
  onConnect: (platform: AdPlatform) => void;
  isLoading?: boolean;
}

export const PlatformCard = ({ platform, minimal = false, onConnect, isLoading = false }: PlatformCardProps) => {
  if (minimal) {
    return (
      <Card className={`${platform.isConnected ? 'border-success-500' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PlatformIcon platform={platform.name} />
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
              onClick={() => onConnect(platform)}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect"}
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
    );
  }

  return (
    <Card className={`${platform.isConnected ? 'border-success-500' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={platform.name} />
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
            onClick={() => onConnect(platform)}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect"} <ExternalLinkIcon className="ml-2 h-4 w-4" />
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
  );
};
