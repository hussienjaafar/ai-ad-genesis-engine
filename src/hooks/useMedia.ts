
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface MediaAsset {
  _id: string;
  businessId: string;
  assetType: 'video' | 'image';
  platform: string;
  assetId: string;
  url: string;
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  metadata: {
    name?: string;
    createdTime?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
    fileSize?: number;
    [key: string]: any;
  };
  transcript?: string;
  detectedText?: string[];
  labels?: Array<{ name: string; confidence: number }>;
  toneAnalysis?: {
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    sentimentScore?: Record<string, number>;
    emotions?: Record<string, number>;
    tones?: Array<{ name: string; score: number }>;
  };
  createdAt: string;
  updatedAt: string;
  lastProcessedAt?: string;
  failureReason?: string;
}

export interface MediaListResponse {
  assets: MediaAsset[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    types: Record<string, number>;
    platforms: Record<string, number>;
    statuses: Record<string, number>;
  };
}

export interface MediaFilterOptions {
  type?: 'video' | 'image' | '';
  platform?: string;
  status?: 'pending' | 'processing' | 'complete' | 'failed' | '';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook to fetch media assets for a business
 */
export const useMediaAssets = (
  businessId: string,
  options: MediaFilterOptions = {}
) => {
  const { type, platform, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  
  return useQuery<MediaListResponse>({
    queryKey: ['mediaAssets', businessId, { type, platform, status, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (platform) params.append('platform', platform);
      if (status) params.append('status', status);
      params.append('page', String(page));
      params.append('limit', String(limit));
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await api.get(`/businesses/${businessId}/media?${params.toString()}`);
      return response.data;
    },
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch a specific media asset
 */
export const useMediaAsset = (businessId: string, mediaId: string) => {
  return useQuery<MediaAsset>({
    queryKey: ['mediaAsset', businessId, mediaId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}/media/${mediaId}`);
      return response.data;
    },
    enabled: !!businessId && !!mediaId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to trigger media retrieval
 */
export const useTriggerMediaRetrieval = (businessId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (platform?: string) => {
      const response = await api.post(`/businesses/${businessId}/media/retrieve`, { platform });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch media assets
      queryClient.invalidateQueries({ queryKey: ['mediaAssets', businessId] });
    }
  });
};
