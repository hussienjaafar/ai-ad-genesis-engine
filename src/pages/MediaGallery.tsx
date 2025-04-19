
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PageHeader from '@/components/Common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useMediaAssets, useTriggerMediaRetrieval, MediaAsset } from '@/hooks/useMedia';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import MediaDetailModal from '@/components/Media/MediaDetailModal';
import { formatDistanceToNow } from 'date-fns';
import { Search, RotateCw } from 'lucide-react';

const MediaGallery = () => {
  const { id: businessId } = useParams<{ id: string }>();
  const [filters, setFilters] = useState({
    type: '' as '' | 'video' | 'image',
    platform: '',
    status: '' as '' | 'pending' | 'processing' | 'complete' | 'failed',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
  });
  
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch media assets using the hook
  const { data, isLoading, isError, error, refetch } = useMediaAssets(businessId!, filters);
  
  // Mutation for triggering media retrieval
  const { mutate: triggerRetrieval, isPending: isRetrieving } = useTriggerMediaRetrieval(businessId!);
  
  // Stats for filter options
  const typeOptions = useMemo(() => {
    if (!data?.stats?.types) return [];
    return Object.entries(data.stats.types).map(([type, count]) => ({
      value: type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)}s (${count})`,
    }));
  }, [data?.stats?.types]);
  
  const platformOptions = useMemo(() => {
    if (!data?.stats?.platforms) return [];
    return Object.entries(data.stats.platforms).map(([platform, count]) => ({
      value: platform,
      label: `${platform.charAt(0).toUpperCase() + platform.slice(1)} (${count})`,
    }));
  }, [data?.stats?.platforms]);
  
  const statusOptions = useMemo(() => {
    if (!data?.stats?.statuses) return [];
    return Object.entries(data.stats.statuses).map(([status, count]) => ({
      value: status,
      label: `${status.charAt(0).toUpperCase() + status.slice(1)} (${count})`,
    }));
  }, [data?.stats?.statuses]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };
  
  // Handle media retrieval
  const handleRetrieveMedia = (platform?: string) => {
    triggerRetrieval(platform, {
      onSuccess: () => {
        toast.success(`Media retrieval job started${platform ? ` for ${platform}` : ''}`);
      },
      onError: () => {
        toast.error('Failed to start media retrieval job');
      }
    });
  };
  
  // Handle asset click
  const handleAssetClick = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Media Gallery" 
        description="View and analyze your media assets from connected platforms"
        actions={
          <Button 
            onClick={() => handleRetrieveMedia()} 
            disabled={isRetrieving}
          >
            <RotateCw className={`mr-2 h-4 w-4 ${isRetrieving ? 'animate-spin' : ''}`} />
            {isRetrieving ? 'Retrieving...' : 'Retrieve Media'}
          </Button>
        }
      />
      
      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-auto">
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {typeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <Select 
                    value={filters.platform} 
                    onValueChange={(value) => handleFilterChange('platform', value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Platforms</SelectItem>
                      {platformOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="processingStatus">Status</SelectItem>
                      <SelectItem value="assetType">Type</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-auto">
                  <Select 
                    value={filters.sortOrder} 
                    onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  className="ml-auto" 
                  onClick={() => refetch()}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Gallery Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-red-500 mb-2">Error loading media assets</p>
                <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
              </CardContent>
            </Card>
          ) : data?.assets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No media assets found</h3>
                <p className="text-muted-foreground mb-6">
                  No media assets match your current filters or no assets have been retrieved yet.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button onClick={() => handleRetrieveMedia('meta')} disabled={isRetrieving}>
                    Retrieve from Meta
                  </Button>
                  <Button onClick={() => handleRetrieveMedia('google')} disabled={isRetrieving}>
                    Retrieve from Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.assets.map((asset) => (
                  <Card 
                    key={asset._id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <div className="relative h-40 overflow-hidden bg-muted">
                      {asset.assetType === 'video' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded px-1.5 py-0.5">
                            Video
                          </span>
                          {asset.metadata.thumbnailUrl ? (
                            <img 
                              src={asset.metadata.thumbnailUrl} 
                              alt={asset.metadata.name || 'Video thumbnail'} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gray-800 text-white">
                              Video
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-black ml-1" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={asset.url || asset.metadata.thumbnailUrl} 
                          alt={asset.metadata.name || 'Media asset'} 
                          className="h-full w-full object-cover"
                        />
                      )}
                      
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs text-white ${
                        asset.processingStatus === 'complete' ? 'bg-green-600' : 
                        asset.processingStatus === 'processing' ? 'bg-blue-600' :
                        asset.processingStatus === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                        {asset.processingStatus}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium truncate">{asset.metadata.name || `${asset.assetType} ${asset.assetId}`}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{asset.platform}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Media analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Media Detail Modal */}
      <MediaDetailModal
        asset={selectedAsset}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAsset(null);
        }}
      />
    </MainLayout>
  );
};

export default MediaGallery;
