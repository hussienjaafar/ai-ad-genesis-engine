
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface BillingDetails {
  usage: {
    currentUsage: number;
    quota: number;
    percentUsed: number;
  };
  subscription: {
    status: string;
    planId: string;
    planName: string;
    billingStatus: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  };
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  tokens: number;
}

export function useBilling(businessId: string) {
  const queryClient = useQueryClient();

  const getBillingDetails = useQuery<BillingDetails>({
    queryKey: ['billing', businessId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/billing`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getPlans = useQuery<Plan[]>({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const response = await api.get('/billing/plans');
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post(`/businesses/${businessId}/billing/subscribe`, { planId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', businessId] });
      toast.success('Successfully subscribed to plan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to subscribe to plan');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/businesses/${businessId}/billing/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', businessId] });
      toast.success('Subscription will be canceled at the end of the billing period');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    },
  });

  return {
    billingDetails: getBillingDetails.data,
    isLoadingBillingDetails: getBillingDetails.isLoading,
    plans: getPlans.data,
    isLoadingPlans: getPlans.isLoading,
    subscribe: subscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCanceling: cancelSubscriptionMutation.isPending,
  };
}
