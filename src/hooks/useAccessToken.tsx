
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setAccessToken as setGlobalAccessToken } from '@/lib/api';

interface AccessTokenContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AccessTokenContext = createContext<AccessTokenContextType | undefined>(undefined);

export const AccessTokenProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Update the global access token when the context value changes
  useEffect(() => {
    setGlobalAccessToken(accessToken);
  }, [accessToken]);

  return (
    <AccessTokenContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AccessTokenContext.Provider>
  );
};

export const useAccessToken = () => {
  const context = useContext(AccessTokenContext);
  if (context === undefined) {
    throw new Error('useAccessToken must be used within an AccessTokenProvider');
  }
  return context;
};
