
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdPlatform } from "@/interfaces/types";
import { useLocation, useNavigate } from "react-router-dom";
import { useOAuth } from "@/hooks/useOAuth";
import { usePlatformStatus } from "@/hooks/usePlatformStatus";
import { PlatformGrid } from "./components/PlatformGrid";

interface PlatformConnectorProps {
  onConnected: (platform: AdPlatform) => void;
  minimal?: boolean;
  businessId?: string;
}

const PlatformConnector = ({ 
  onConnected, 
  minimal = false, 
  businessId = "123" 
}: PlatformConnectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<AdPlatform | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isLoading, currentPlatform: currentOAuthPlatform, initiateOAuth } = useOAuth();
  const { platforms, setPlatforms } = usePlatformStatus(businessId);
  
  // Check if returning from OAuth flow with success
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
  }, [location, platforms, onConnected, navigate, setPlatforms]);

  const handleConnect = (platform: AdPlatform) => {
    if (platform.name === "facebook" || platform.name === "google") {
      // Use OAuth flow for Facebook and Google
      initiateOAuth(platform.name);
      setCurrentPlatform(platform);
    } else {
      // Use dialog for other platforms
      setCurrentPlatform(platform);
      setIsDialogOpen(true);
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

  return (
    <PlatformGrid
      platforms={platforms}
      onConnect={handleConnect}
      minimal={minimal}
      isLoading={isLoading}
      currentOAuthPlatform={currentOAuthPlatform}
      isDialogOpen={isDialogOpen}
      currentPlatform={currentPlatform}
      onOpenChange={setIsDialogOpen}
      onConfirmDialog={handleConnectConfirm}
    />
  );
};

export default PlatformConnector;
