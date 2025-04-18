
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { AccessTokenProvider } from './hooks/useAccessToken.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AccessTokenProvider>
      <App />
    </AccessTokenProvider>
  </QueryClientProvider>
);
