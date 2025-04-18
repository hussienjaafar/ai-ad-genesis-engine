
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAccessToken } from './useAccessToken';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'client' | 'staff';
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { accessToken, setAccessToken } = useAccessToken();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Successfully logged in');
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
      toast.success('Successfully registered');
      navigate('/onboarding');
    },
  });

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      queryClient.setQueryData(['auth', 'me'], null);
      navigate('/login');
    }
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
  };
}
