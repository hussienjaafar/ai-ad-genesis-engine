
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl();
        
        if (error) {
          console.error('Auth callback error:', error.message);
          toast.error('Failed to complete authentication');
          navigate('/login');
          return;
        }

        if (data?.session) {
          toast.success('Successfully signed in!');
          navigate('/');
        } else {
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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
