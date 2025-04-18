
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
  const [oauthPopup, setOauthPopup] = useState<Window | null>(null);
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null);
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
  
  // Listen for messages from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data === 'oauth-success') {
        // Cleanup polling timer
        if (pollTimer) clearInterval(pollTimer);
        setPollTimer(null);
        
        // Success message already handled by URL parameter check
        if (oauthPopup && !oauthPopup.closed) {
          oauthPopup.close();
        }
        setOauthPopup(null);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [oauthPopup, pollTimer]);

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
    setCurrentPlatform(platforms.find(p => p.name === platformName) || null);
    
    try {
      // Open OAuth in popup
      const oauthPath = platformName === "facebook" ? "meta" : platformName;
      const popupUrl = `/api/oauth/${oauthPath}/init?businessId=${businessId}`;
      
      // Open popup centered
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        popupUrl, 
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      setOauthPopup(popup);
      
      // Start polling to check if popup closed
      const timer = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(timer);
          setPollTimer(null);
          setIsLoading(false);
          
          // If popup closed without success message, show error
          const platform = platforms.find(p => p.name === platformName);
          if (platform && !platform.isConnected) {
            toast.error(`Authorization cancelled for ${platformName}`);
          }
        }
      }, 1000);
      
      setPollTimer(timer);
      
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

  // Fetch platform status from API (in real app)
  useEffect(() => {
    // This would be an API call in a real app
    const fetchPlatformStatus = async () => {
      try {
        // Mock data for demonstration
        const platformsWithStatus = platforms.map(platform => {
          if (platform.name === 'facebook') {
            return {
              ...platform,
              needsReauth: Math.random() > 0.5 // Random for demo purposes
            };
          }
          return platform;
        });
        
        setPlatforms(platformsWithStatus);
      } catch (error) {
        console.error('Error fetching platform status:', error);
      }
    };
    
    if (businessId) {
      fetchPlatformStatus();
    }
  }, [businessId]);

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
