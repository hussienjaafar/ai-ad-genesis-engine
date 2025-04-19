
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { MediaAsset } from '@/hooks/useMedia';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MediaDetailModalProps {
  asset: MediaAsset | null;
  open: boolean;
  onClose: () => void;
}

const MediaDetailModal = ({ asset, open, onClose }: MediaDetailModalProps) => {
  useEffect(() => {
    // Clean up video/audio elements when modal closes
    return () => {
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.pause();
        video.src = '';
        video.load();
      });
    };
  }, [open]);

  if (!asset) return null;

  const created = new Date(asset.createdAt);
  const lastProcessed = asset.lastProcessedAt ? new Date(asset.lastProcessedAt) : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {asset.metadata.name || asset.assetId}
            <Badge variant={asset.processingStatus === 'complete' ? 'success' : 
                           asset.processingStatus === 'failed' ? 'destructive' : 'secondary'}>
              {asset.processingStatus}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {asset.assetType === 'video' ? 'Video' : 'Image'} asset from {asset.platform}
            {' • '} Added {formatDistanceToNow(created, { addSuffix: true })}
            {lastProcessed && ` • Last processed ${formatDistanceToNow(lastProcessed, { addSuffix: true })}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {asset.assetType === 'video' ? (
                <video 
                  src={asset.url} 
                  controls 
                  style={{ maxHeight: '400px' }}
                  className="rounded-md"
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <img 
                  src={asset.url || asset.metadata.thumbnailUrl} 
                  alt={asset.metadata.name || 'Media asset'} 
                  style={{ maxHeight: '400px' }}
                  className="rounded-md"
                />
              )}
            </CardContent>
          </Card>

          {/* Tabs for different analysis results */}
          <Tabs defaultValue="metadata">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              {asset.assetType === 'video' && asset.transcript && (
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              )}
              {asset.detectedText && asset.detectedText.length > 0 && (
                <TabsTrigger value="text">Detected Text</TabsTrigger>
              )}
              {asset.toneAnalysis && (
                <TabsTrigger value="tone">Tone Analysis</TabsTrigger>
              )}
              {asset.labels && asset.labels.length > 0 && (
                <TabsTrigger value="labels">Labels</TabsTrigger>
              )}
            </TabsList>

            {/* Metadata Tab */}
            <TabsContent value="metadata">
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <dt className="font-semibold">Platform ID</dt>
                    <dd>{asset.assetId}</dd>
                    
                    {asset.metadata.createdTime && (
                      <>
                        <dt className="font-semibold">Created (Platform)</dt>
                        <dd>{new Date(asset.metadata.createdTime).toLocaleString()}</dd>
                      </>
                    )}
                    
                    {asset.metadata.width && asset.metadata.height && (
                      <>
                        <dt className="font-semibold">Dimensions</dt>
                        <dd>{asset.metadata.width}×{asset.metadata.height}</dd>
                      </>
                    )}
                    
                    {asset.metadata.duration && (
                      <>
                        <dt className="font-semibold">Duration</dt>
                        <dd>{Math.floor(asset.metadata.duration / 60)}:{(asset.metadata.duration % 60).toString().padStart(2, '0')}</dd>
                      </>
                    )}
                    
                    {asset.metadata.fileSize && (
                      <>
                        <dt className="font-semibold">File Size</dt>
                        <dd>{(asset.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</dd>
                      </>
                    )}
                    
                    {asset.metadata.format && (
                      <>
                        <dt className="font-semibold">Format</dt>
                        <dd>{asset.metadata.format}</dd>
                      </>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transcript Tab */}
            {asset.assetType === 'video' && asset.transcript && (
              <TabsContent value="transcript">
                <Card>
                  <CardHeader>
                    <CardTitle>Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{asset.transcript}</div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Detected Text Tab */}
            {asset.detectedText && asset.detectedText.length > 0 && (
              <TabsContent value="text">
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Text</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {asset.detectedText.map((text, index) => (
                        <li key={index}>{text}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Tone Analysis Tab */}
            {asset.toneAnalysis && (
              <TabsContent value="tone">
                <Card>
                  <CardHeader>
                    <CardTitle>Tone Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sentiment */}
                      {asset.toneAnalysis.sentiment && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Sentiment</h4>
                          <Badge variant={
                            asset.toneAnalysis.sentiment === 'positive' ? 'success' :
                            asset.toneAnalysis.sentiment === 'negative' ? 'destructive' :
                            'secondary'
                          }>
                            {asset.toneAnalysis.sentiment.charAt(0).toUpperCase() + asset.toneAnalysis.sentiment.slice(1)}
                          </Badge>
                          
                          {asset.toneAnalysis.sentimentScore && (
                            <div className="mt-4 space-y-2">
                              {Object.entries(asset.toneAnalysis.sentimentScore).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-xs font-medium w-20">{key}</span>
                                  <div className="h-2 rounded-full bg-secondary flex-1">
                                    <div 
                                      className={`h-2 rounded-full ${key === 'positive' ? 'bg-green-500' : key === 'negative' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                      style={{ width: `${(value * 100).toFixed()}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs">{(value * 100).toFixed()}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Emotions */}
                      {asset.toneAnalysis.emotions && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Emotions</h4>
                          <div className="space-y-2">
                            {Object.entries(asset.toneAnalysis.emotions).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-xs font-medium w-20">{key}</span>
                                <div className="h-2 rounded-full bg-secondary flex-1">
                                  <div 
                                    className="h-2 rounded-full bg-primary" 
                                    style={{ width: `${(value * 100).toFixed()}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{(value * 100).toFixed()}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Tones */}
                      {asset.toneAnalysis.tones && asset.toneAnalysis.tones.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium mb-2">Detected Tones</h4>
                          <div className="flex flex-wrap gap-2">
                            {asset.toneAnalysis.tones.map((tone, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <Badge variant="outline">{tone.name}</Badge>
                                <span className="text-xs">{(tone.score * 100).toFixed()}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Labels Tab */}
            {asset.labels && asset.labels.length > 0 && (
              <TabsContent value="labels">
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Labels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {asset.labels
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((label, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Badge variant="outline">{label.name}</Badge>
                            <span className="text-xs">{label.confidence.toFixed()}%</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
          
          {/* Error Message */}
          {asset.processingStatus === 'failed' && asset.failureReason && (
            <Card className="border-red-300">
              <CardHeader>
                <CardTitle className="text-red-500">Processing Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{asset.failureReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDetailModal;
