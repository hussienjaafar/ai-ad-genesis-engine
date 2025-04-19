
import { Badge } from '@/components/ui/badge';
import { MediaAsset } from '@/hooks/useMedia';

interface MediaPreviewProps {
  mediaAsset: MediaAsset;
}

const MediaPreview = ({ mediaAsset }: MediaPreviewProps) => {
  return (
    <div className="mb-4 p-3 bg-muted rounded-md">
      <div className="flex items-start gap-3">
        {mediaAsset.assetType === 'image' && mediaAsset.url && (
          <img 
            src={mediaAsset.url} 
            alt={mediaAsset.metadata.name || 'Media asset'} 
            className="w-16 h-16 object-cover rounded"
          />
        )}
        {mediaAsset.assetType === 'video' && mediaAsset.metadata.thumbnailUrl && (
          <div className="relative w-16 h-16">
            <img 
              src={mediaAsset.metadata.thumbnailUrl} 
              alt={mediaAsset.metadata.name || 'Video thumbnail'} 
              className="w-16 h-16 object-cover rounded"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                <div className="w-0 h-0 border-y-6 border-y-transparent border-l-8 border-l-black ml-1" />
              </div>
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium">
              {mediaAsset.metadata.name || `${mediaAsset.assetType} asset`}
            </h4>
            <Badge variant="outline" className="text-xs">
              {mediaAsset.platform}
            </Badge>
          </div>
          {mediaAsset.transcript && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {mediaAsset.transcript.substring(0, 100)}
              {mediaAsset.transcript.length > 100 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
