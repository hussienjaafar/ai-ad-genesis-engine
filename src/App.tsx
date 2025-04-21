
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import OAuthCallback from './pages/OAuthCallback';
import Businesses from './pages/Businesses';
import BusinessDetails from './pages/BusinessDetails';
import Content from './pages/Content';
import NotFound from './pages/NotFound';
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Experiments from "./pages/Experiments";
import ExperimentResults from "./pages/ExperimentResults";
import Agencies from "./pages/Agencies";
import AgencyOverview from "./pages/AgencyOverview";
import Billing from "./pages/Billing";
import GenerateContent from "./pages/GenerateContent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:id" element={<BusinessDetails />} />
        <Route path="/businesses/:id/billing" element={<Billing />} />
        <Route path="/businesses/:id/generate" element={<GenerateContent />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/content/:businessId" element={<Content />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/businesses/:id/experiments" element={<Experiments />} />
        <Route path="/experiments/:id" element={<ExperimentResults />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/agencies/:id/overview" element={<AgencyOverview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
