
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // The hash fragment in the URL contains the auth info from the OAuth provider
      // We need to handle this by setting the session from the hash
      const hashParams = window.location.hash;
      
      if (hashParams) {
        // If we have hash params, we need to handle them manually
        try {
          // This will detect the hash parameters and set the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('OAuth callback error:', error.message);
            toast.error('Failed to complete authentication');
            navigate('/login');
            return;
          }

          if (data.session) {
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
      } else {
        // If no hash parameters, fall back to standard session check
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error.message);
          toast.error('Failed to complete authentication');
          navigate('/login');
          return;
        }

        if (session) {
          toast.success('Successfully signed in!');
          navigate('/');
        } else {
          navigate('/login');
        }
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
