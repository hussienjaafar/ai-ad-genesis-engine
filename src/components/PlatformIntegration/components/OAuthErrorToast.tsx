
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OAuthErrorOptions {
  platform: string;
  errorType: string;
  errorMessage?: string;
  onRetry?: () => void;
}

/**
 * Shows a toast notification for OAuth errors with a retry button and help link
 */
const showOAuthErrorToast = ({ 
  platform, 
  errorType, 
  errorMessage, 
  onRetry 
}: OAuthErrorOptions) => {
  const { t } = useTranslation();
  
  // Map error types to i18n keys when available
  const getErrorMessage = () => {
    // First try platform-specific error
    const i18nKey = `errors.${platform}.${errorType}`;
    const i18nMessage = t(i18nKey, { defaultValue: null });
    
    if (i18nMessage) return i18nMessage;
    
    // Fall back to provided error message
    if (errorMessage) return `${platform} error: ${errorMessage}`;
    
    // Generic fallback
    return t(`errors.${platform}.generic`, { defaultValue: `There was an error connecting to ${platform}` });
  };

  const message = getErrorMessage();
  
  toast(message, {
    // Auto-dismiss after 4 seconds
    duration: 4000,
    
    // Add action buttons
    action: {
      label: t('common.retry'),
      onClick: () => {
        if (onRetry) onRetry();
      }
    },
    
    // Add help link
    description: (
      <a
        href={`/help/connect-${platform}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-xs mt-1"
      >
        Need help? <ExternalLink size={12} />
      </a>
    )
  });
};

export default showOAuthErrorToast;
