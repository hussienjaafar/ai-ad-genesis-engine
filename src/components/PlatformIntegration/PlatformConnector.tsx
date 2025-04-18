
import { useState, useEffect } from "react";
import { mockAdPlatforms } from "@/lib/mockData";
import { toast } from "sonner";
import { AdPlatform } from "@/interfaces/types";
import { PlatformCard } from "./components/PlatformCard";
import { ConnectPlatformDialog } from "./components/ConnectPlatformDialog";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface PlatformConnectorProps {
  onConnected: (platform: AdPlatform) => void;
  minimal?: boolean;
  businessId?: string;
}

const PlatformConnector = ({ onConnected, minimal = false, businessId = "123" }: PlatformConnectorProps) => {
  const [platforms, setPlatforms] = useState(mockAdPlatforms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<AdPlatform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if returning from OAuth flow
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const success = query.get('success');
    
    if (success) {
      const platform = platforms.find(p => p.name === success);
      if (platform) {
        const updatedPlatform = {
          ...platform,
          isConnected: true,
          lastSynced: new Date().toISOString()
        };
        
        setPlatforms(prevPlatforms => 
          prevPlatforms.map(p => p.id === platform.id ? updatedPlatform : p)
        );
        
        onConnected(updatedPlatform);
        
        toast.success(`${platform.name} connected successfully!`);
        
        // Remove query param without page reload
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, platforms, onConnected, navigate]);

  const handleConnect = (platform: AdPlatform) => {
    if (platform.name === "facebook" || platform.name === "google") {
      // Use OAuth flow for Facebook and Google
      initiateOAuth(platform.name);
    } else {
      // Use dialog for other platforms
      setCurrentPlatform(platform);
      setIsDialogOpen(true);
    }
  };
  
  const initiateOAuth = async (platformName: string) => {
    setIsLoading(true);
    try {
      // Redirect to OAuth initialization endpoint
      const oauthPath = platformName === "facebook" ? "meta" : platformName;
      window.location.href = `/api/oauth/${oauthPath}/init?businessId=${businessId}`;
    } catch (error) {
      toast.error(`Failed to connect to ${platformName}`);
      console.error("OAuth initialization error:", error);
      setIsLoading(false);
    }
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
            isLoading={isLoading && currentPlatform?.id === platform.id}
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
            isLoading={isLoading && currentPlatform?.id === platform.id}
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
