
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ContentGenerationParams {
  contentType: 'facebook' | 'google' | 'videoScript';
  params: Record<string, any>;
  sourceInsightId?: string;
}

interface GeneratedContent {
  contentId: string;
  parsedContent: Record<string, any>;
}

export function useContentGeneration(businessId: string) {
  const queryClient = useQueryClient();

  const generateContentMutation = useMutation({
    mutationFn: async (data: ContentGenerationParams): Promise<GeneratedContent> => {
      const response = await api.post(`/businesses/${businessId}/content/generate`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', businessId] });
      toast.success('Content generated successfully');
    },
  });

  const getContentList = (contentType?: string) => {
    return useQuery({
      queryKey: ['content', businessId, contentType],
      queryFn: async () => {
        const params = contentType ? { contentType } : {};
        const response = await api.get(`/businesses/${businessId}/content`, { params });
        return response.data;
      },
      staleTime: 5 * 60_000, // 5 minutes
    });
  };

  const getContentById = (contentId: string) => {
    return useQuery({
      queryKey: ['content', contentId],
      queryFn: async () => {
        const response = await api.get(`/content/${contentId}`);
        return response.data;
      },
      enabled: !!contentId,
      staleTime: 5 * 60_000, // 5 minutes
    });
  };

  return {
    generateContent: generateContentMutation.mutate,
    isGenerating: generateContentMutation.isPending,
    getContentList,
    getContentById,
    generatedContent: generateContentMutation.data,
  };
}
