
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AccessTokenProvider } from './hooks/useAccessToken.tsx'

createRoot(document.getElementById("root")!).render(
  <AccessTokenProvider>
    <App />
  </AccessTokenProvider>
);
