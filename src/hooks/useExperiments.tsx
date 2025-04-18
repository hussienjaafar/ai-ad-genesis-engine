
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Experiment, ExperimentResult, CreateExperimentDto } from '@/interfaces/experiment';
import { toast } from 'sonner';

export const useExperiments = (businessId: string) => {
  const queryClient = useQueryClient();

  const createExperiment = useMutation({
    mutationFn: async (data: CreateExperimentDto) => {
      const response = await api.post(`/businesses/${businessId}/experiments`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', businessId] });
      toast.success('Experiment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create experiment');
    }
  });

  const updateExperimentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'active' | 'paused' | 'completed' }) => {
      const response = await api.patch(`/experiments/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', businessId] });
      toast.success('Experiment status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update experiment status');
    }
  });

  return {
    createExperiment,
    updateExperimentStatus,
    useGetExperiments: () => useQuery<Experiment[]>({
      queryKey: ['experiments', businessId],
      queryFn: async () => {
        const response = await api.get(`/businesses/${businessId}/experiments`);
        return response.data;
      },
      staleTime: 5 * 60_000 // 5 minutes
    }),
    useGetExperimentResults: (experimentId: string) => useQuery<ExperimentResult>({
      queryKey: ['experimentResults', experimentId],
      queryFn: async () => {
        const response = await api.get(`/businesses/${businessId}/experiments/${experimentId}/results`);
        return response.data;
      },
      staleTime: 5 * 60_000, // 5 minutes
      refetchInterval: 5 * 60_000 // Refresh every 5 minutes
    })
  };
};
