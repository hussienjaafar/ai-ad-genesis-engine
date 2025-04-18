
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook to fetch performance metrics for a business
 */
export const usePerformanceMetrics = (businessId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['performanceMetrics', businessId, days],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/analytics/performance?days=${days}`);
      return response.data;
    },
    enabled: !!businessId,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook to fetch performance insights for a business
 */
export const usePerformanceInsights = (businessId: string) => {
  return useQuery({
    queryKey: ['performanceInsights', businessId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/analytics/insights`);
      return response.data;
    },
    enabled: !!businessId,
    refetchOnWindowFocus: false
  });
};
