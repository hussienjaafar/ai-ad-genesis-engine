
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
      
      // Transform the response data to match the expected format by our components
      const data = response.data;
      
      // If patternInsights exist, make sure they have the old format properties
      if (data.patternInsights && Array.isArray(data.patternInsights)) {
        data.patternInsights = data.patternInsights.map(insight => {
          // Map new format fields to old format fields for backward compatibility
          // if they don't already exist
          if (!insight.element) {
            insight.element = insight.title || 'Unknown element';
          }
          if (!insight.elementType) {
            insight.elementType = insight.category || 'Unknown type';
          }
          if (!insight.performance) {
            // Create a default performance object based on confidence
            const confidenceValue = insight.confidence || 0.5;
            insight.performance = {
              withElement: {
                impressions: 1000,
                clicks: 100 * confidenceValue,
                ctr: 0.1 * confidenceValue,
                sampleSize: 1000
              },
              withoutElement: {
                impressions: 1000,
                clicks: 50,
                ctr: 0.05,
                sampleSize: 1000
              },
              uplift: confidenceValue,
              confidence: confidenceValue
            };
          }
          return insight;
        });
      }
      
      return data;
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
    patternInsights: insights?.patternInsights || [],
    lastUpdated: performanceData?.lastUpdated || null, 
    isLoading
  };
};
