
interface EngagementMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  sampleSize: number;
}

export function calculateEngagementMetrics(
  clicks: number,
  impressions: number,
  sampleSize: number
): EngagementMetrics {
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    sampleSize
  };
}

export function calculateUplift(withCtr: number, withoutCtr: number): number {
  return withoutCtr > 0 ? (withCtr - withoutCtr) / withoutCtr : 0;
}
