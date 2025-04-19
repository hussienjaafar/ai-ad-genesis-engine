
import { Badge } from '@/components/ui/badge';
import { MediaAsset } from '@/hooks/useMedia';

interface VideoPreviewProps {
  mediaAsset: MediaAsset;
}

const VideoPreview = ({ mediaAsset }: VideoPreviewProps) => {
  return (
    <div className="flex items-start gap-3">
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
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium">
            {mediaAsset.metadata.name || 'Video asset'}
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
  );
};

export default VideoPreview;

