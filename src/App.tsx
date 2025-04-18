import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Businesses from './pages/Businesses';
import BusinessDetails from './pages/BusinessDetails';
import OAuthCallback from './pages/OAuthCallback';
import Content from './pages/Content';
import NotFound from './pages/NotFound';
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/businesses/:id" element={<BusinessDetails />} />
            <Route path="/oauth/:platform/callback" element={<OAuthCallback />} />
            <Route path="/content/:businessId" element={<Content />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
