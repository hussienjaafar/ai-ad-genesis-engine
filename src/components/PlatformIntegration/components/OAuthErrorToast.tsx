
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';

/**
 * Shows a toast notification for OAuth errors with a retry action
 * @param platform The platform that encountered an error (meta, google)
 */
export const showOAuthErrorToast = (platform: 'meta' | 'google') => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Show toast with retry action
  toast({
    title: t('auth.oauthCancelled'),
    action: (
      <div 
        onClick={() => navigate(`/api/oauth/${platform}/init`)} 
        className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/80 cursor-pointer"
      >
        {t('common.retry')}
      </div>
    ),
    duration: 4000, // 4 seconds
  });
};

export default showOAuthErrorToast;
