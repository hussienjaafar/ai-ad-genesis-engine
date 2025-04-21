
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (session) {
      navigate('/', { replace: true });
      return;
    }

    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        
        // The URL hash fragment contains the access token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (!accessToken) {
          console.error('No access token found in URL');
          toast.error('Authentication failed: No access token found');
          navigate('/login');
          return;
        }

        console.log('Setting session with tokens from URL hash');
        
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error('OAuth callback error:', error.message);
          toast.error('Failed to complete authentication');
          navigate('/login');
          return;
        }

        if (data?.session) {
          // Successfully set the session
          console.log('Session set successfully, navigating to home');
          
          // Give the auth state change listener time to update
          setTimeout(() => {
            toast.success('Successfully signed in!');
            navigate('/', { replace: true });
          }, 1000);
        } else {
          console.error('No session data returned after setting session');
          toast.error('Authentication process failed');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error processing authentication:', err);
        toast.error('Authentication process failed');
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, session]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        {isProcessing && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        )}
      </div>
    </div>
  );
}
