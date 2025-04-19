
import { MediaAsset } from '@/hooks/useMedia';
import ImagePreview from './ImagePreview';
import VideoPreview from './VideoPreview';

interface MediaPreviewProps {
  mediaAsset: MediaAsset;
}

const MediaPreview = ({ mediaAsset }: MediaPreviewProps) => {
  return (
    <div className="mb-4 p-3 bg-muted rounded-md">
      {mediaAsset.assetType === 'image' && mediaAsset.url && (
        <ImagePreview mediaAsset={mediaAsset} />
      )}
      {mediaAsset.assetType === 'video' && mediaAsset.metadata.thumbnailUrl && (
        <VideoPreview mediaAsset={mediaAsset} />
      )}
    </div>
  );
};

export default MediaPreview;

