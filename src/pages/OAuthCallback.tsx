
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The URL hash fragment contains the access token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // Set the session with the access token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (error) {
            console.error('OAuth callback error:', error.message);
            toast.error('Failed to complete authentication');
            navigate('/login');
            return;
          }

          if (data?.session) {
            toast.success('Successfully signed in!');
            navigate('/', { replace: true });
          } else {
            navigate('/login');
          }
        } else {
          // Fallback to checking current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error.message);
            toast.error('Failed to complete authentication');
            navigate('/login');
            return;
          }

          if (session) {
            toast.success('Successfully signed in!');
            navigate('/', { replace: true });
          } else {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Error processing authentication:', err);
        toast.error('Authentication process failed');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
