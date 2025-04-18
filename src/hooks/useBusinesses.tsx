
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Industry } from '@/interfaces/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface BusinessProfile {
  name: string;
  businessType: Industry;
  contact: {
    email: string;
  };
}

export function useBusinesses() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createBusinessMutation = useMutation({
    mutationFn: async (data: BusinessProfile) => {
      const response = await api.post('/businesses', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Business profile created successfully');
      navigate('/dashboard');
    },
  });

  const getBusiness = (id: string) => {
    return useQuery({
      queryKey: ['businesses', id],
      queryFn: async () => {
        const response = await api.get(`/businesses/${id}`);
        return response.data;
      },
    });
  };

  const updateOfferings = (businessId: string) => {
    return useMutation({
      mutationFn: async (offerings: string[]) => {
        const response = await api.post(`/businesses/${businessId}/offerings`, { offerings });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businesses', businessId] });
        toast.success('Business offerings updated');
      },
    });
  };

  return {
    createBusiness: createBusinessMutation.mutate,
    getBusiness,
    updateOfferings,
    useGetAllBusinesses: () => useQuery({
      queryKey: ['businesses'],
      queryFn: async () => {
        const response = await api.get('/businesses');
        return response.data;
      }
    })
  };
}
