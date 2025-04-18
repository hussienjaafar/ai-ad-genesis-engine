
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Agency, CreateAgencyDto, UpdateAgencyClientsDto, AgencyOverview } from '@/interfaces/agency';
import { toast } from 'sonner';

export const useAgencies = () => {
  const queryClient = useQueryClient();

  const createAgency = useMutation({
    mutationFn: async (data: CreateAgencyDto) => {
      const response = await api.post('/agencies', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Agency created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create agency');
    }
  });

  const updateAgencyClients = (agencyId: string) => useMutation({
    mutationFn: async (data: UpdateAgencyClientsDto) => {
      const response = await api.put(`/agencies/${agencyId}/clients`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies', agencyId] });
      const action = "add" ? "added to" : "removed from";
      toast.success(`Clients ${action} agency successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update agency clients');
    }
  });

  return {
    createAgency,
    updateAgencyClients,
    useGetAgencies: () => useQuery<Agency[]>({
      queryKey: ['agencies'],
      queryFn: async () => {
        const response = await api.get('/agencies');
        return response.data;
      }
    }),
    useGetAgency: (agencyId: string) => useQuery<Agency>({
      queryKey: ['agencies', agencyId],
      queryFn: async () => {
        const response = await api.get(`/agencies/${agencyId}`);
        return response.data;
      },
      enabled: !!agencyId
    }),
    useAgencyOverview: (agencyId: string) => useQuery<AgencyOverview>({
      queryKey: ['agencies', agencyId, 'overview'],
      queryFn: async () => {
        const response = await api.get(`/agencies/${agencyId}/overview`);
        return response.data;
      },
      enabled: !!agencyId
    })
  };
};
