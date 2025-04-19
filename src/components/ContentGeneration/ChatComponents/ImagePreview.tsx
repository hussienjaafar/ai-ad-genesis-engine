
import { Badge } from '@/components/ui/badge';
import { MediaAsset } from '@/hooks/useMedia';

interface ImagePreviewProps {
  mediaAsset: MediaAsset;
}

const ImagePreview = ({ mediaAsset }: ImagePreviewProps) => {
  return (
    <div className="flex items-start gap-3">
      <img 
        src={mediaAsset.url} 
        alt={mediaAsset.metadata.name || 'Media asset'} 
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium">
            {mediaAsset.metadata.name || 'Image asset'}
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

export default ImagePreview;

