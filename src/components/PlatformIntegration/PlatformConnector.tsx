
import { useState } from "react";
import { mockAdPlatforms } from "@/lib/mockData";
import { toast } from "sonner";
import { AdPlatform } from "@/interfaces/types";
import { PlatformCard } from "./components/PlatformCard";
import { ConnectPlatformDialog } from "./components/ConnectPlatformDialog";

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
      
      toast.success(`${currentPlatform.name} connected successfully!`);
      setIsDialogOpen(false);
    }
  };

  if (minimal) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.slice(0, 2).map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onConnect={handleConnect}
            minimal={true}
          />
        ))}
        <ConnectPlatformDialog
          platform={currentPlatform}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onConfirm={handleConnectConfirm}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onConnect={handleConnect}
          />
        ))}
      </div>
      <ConnectPlatformDialog
        platform={currentPlatform}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConnectConfirm}
      />
    </>
  );
};

export default PlatformConnector;
