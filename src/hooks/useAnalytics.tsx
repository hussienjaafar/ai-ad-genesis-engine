
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PerformanceMetrics, InsightData } from '@/interfaces/analytics';

/**
 * Hook to fetch performance metrics for a business
 */
export const usePerformanceMetrics = (businessId: string, days: number = 30) => {
  return useQuery<PerformanceMetrics>({
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
  return useQuery<InsightData>({
    queryKey: ['performanceInsights', businessId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/analytics/insights`);
      return response.data;
    },
    enabled: !!businessId,
    refetchOnWindowFocus: false
  });
};
