
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        const { data, error } = await supabase.auth.getSessionFromUrl();
        
        if (error) {
          console.error('OAuth callback error:', error.message);
          setError(error.message);
          toast.error(error.message);
          navigate('/login');
          return;
        }

        if (data?.session) {
          console.log('Session obtained successfully, redirecting...');
          toast.success('Successfully signed in!');
          navigate('/', { replace: true });
        } else {
          console.error('No session data returned');
          toast.error('Authentication failed');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error processing authentication:', err);
        toast.error('Authentication process failed');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">
          Login failed: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
