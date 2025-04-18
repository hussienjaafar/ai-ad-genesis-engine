
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const OAuthCallback = () => {
  const { platform } = useParams<{ platform: string }>();

  useEffect(() => {
    // Process OAuth callback
    console.log(`Processing ${platform} OAuth callback`);
  }, [platform]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Connecting to {platform}</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Please wait while we connect your account...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
