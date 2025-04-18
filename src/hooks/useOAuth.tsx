
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import showOAuthErrorToast from "@/components/PlatformIntegration/components/OAuthErrorToast";

/**
 * Hook to manage OAuth flows and handle redirects with error/success states
 */
export function useOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null);
  const [oauthPopup, setOauthPopup] = useState<Window | null>(null);
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle success/error query parameters
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const success = query.get('success');
    const error = query.get('error');
    const errorReason = query.get('error_reason');
    const errorDescription = query.get('error_description');
    
    if (success) {
      // Success case is handled by parent component
      // Remove query params without page reload
      navigate(location.pathname, { replace: true });
    } else if (error) {
      // Handle OAuth error from redirect
      showOAuthErrorToast({
        platform: error === 'facebook' ? 'facebook' : 'google', 
        errorType: errorReason || 'unknown',
        errorMessage: errorDescription || '',
        onRetry: () => {
          // Retry the OAuth flow for the platform that failed
          initiateOAuth(error === 'facebook' ? 'facebook' : 'google', '123');
        }
      });
      
      // Remove query params without page reload
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, t]);
  
  // Listen for messages from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data === 'oauth-success') {
        // Cleanup polling timer
        if (pollTimer) clearInterval(pollTimer);
        setPollTimer(null);
        
        if (oauthPopup && !oauthPopup.closed) {
          oauthPopup.close();
        }
        setOauthPopup(null);
        setIsLoading(false);
      }
      
      if (event.data && typeof event.data === 'object' && event.data.type === 'oauth-error') {
        // Handle error message from popup
        // Cleanup polling timer
        if (pollTimer) clearInterval(pollTimer);
        setPollTimer(null);
        
        if (oauthPopup && !oauthPopup.closed) {
          oauthPopup.close();
        }
        setOauthPopup(null);
        setIsLoading(false);
        
        // Show error toast with retry option
        showOAuthErrorToast({
          platform: currentPlatform || 'unknown',
          errorType: event.data.errorReason || 'unknown',
          errorMessage: event.data.errorDescription || '',
          onRetry: () => {
            if (currentPlatform) {
              initiateOAuth(currentPlatform, '123');
            }
          }
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [oauthPopup, pollTimer, currentPlatform]);
  
  // Function to initiate OAuth flow
  const initiateOAuth = (platformName: string, businessId: string) => {
    setIsLoading(true);
    setCurrentPlatform(platformName);
    
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
          
          // If popup closed without success message, show error toast
          showOAuthErrorToast({
            platform: platformName,
            errorType: 'cancelled',
            errorMessage: t('auth.oauthCancelled'),
            onRetry: () => initiateOAuth(platformName, businessId)
          });
        }
      }, 1000);
      
      setPollTimer(timer);
      
    } catch (error) {
      console.error("OAuth initialization error:", error);
      setIsLoading(false);
      
      // Show generic error toast
      toast.error(`Failed to connect to ${platformName}`);
    }
  };
  
  return {
    isLoading,
    currentPlatform,
    initiateOAuth
  };
}
