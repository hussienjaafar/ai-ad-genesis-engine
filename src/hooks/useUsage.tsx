
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { subDays } from 'date-fns';

interface UsageRecord {
  _id: string;
  businessId: string;
  date: string;
  tokensRequested: number;
  tokensConsumed: number;
  createdAt: string;
  updatedAt: string;
}

export function useUsage(businessId: string, days: number = 30) {
  const startDate = subDays(new Date(), days);
  
  const usageQuery = useQuery<UsageRecord[]>({
    queryKey: ['usage', businessId, days],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/billing/usage`, {
        params: { days },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate today's usage
  const todayUsage = usageQuery.data?.find(
    record => new Date(record.date).toDateString() === new Date().toDateString()
  );

  // Calculate total usage for the period
  const totalUsage = usageQuery.data?.reduce(
    (sum, record) => sum + record.tokensConsumed, 
    0
  ) || 0;

  // Format data for the sparkline chart
  const chartData = usageQuery.data?.map(record => ({
    date: new Date(record.date).toLocaleDateString(),
    tokens: record.tokensConsumed,
  })) || [];

  return {
    usageData: usageQuery.data,
    isLoading: usageQuery.isLoading,
    error: usageQuery.error,
    todayUsage: {
      tokensRequested: todayUsage?.tokensRequested || 0,
      tokensConsumed: todayUsage?.tokensConsumed || 0,
    },
    totalUsage,
    chartData,
    startDate,
  };
}
