
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
    refetchOnWindowFocus: false,
    staleTime: 5 * 60_000 // 5 minutes
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
    refetchOnWindowFocus: false,
    staleTime: 5 * 60_000 // 5 minutes
  });
};

// For backwards compatibility, export a combined hook
export const useAnalytics = (businessId: string) => {
  const { 
    data: performanceData, 
    isLoading: isLoadingMetrics 
  } = usePerformanceMetrics(businessId);

  const { 
    data: insights, 
    isLoading: isLoadingInsights 
  } = usePerformanceInsights(businessId);

  const isLoading = isLoadingMetrics || isLoadingInsights;
  
  return {
    kpis: performanceData?.kpis || null,
    performanceData: performanceData?.daily || [],
    insights: insights || null,
    patterns: insights?.patternInsights || [], // Fix: use patternInsights instead of patterns
    lastUpdated: performanceData?.lastUpdated || null, // This might need to be added to the PerformanceMetrics interface
    isLoading
  };
};
