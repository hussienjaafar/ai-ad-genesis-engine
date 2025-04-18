
export interface PerformanceMetrics {
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
  };
  data: DailyMetric[];
}

export interface DailyMetric {
  _id: {
    date: string;
  };
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
  };
}

export interface InsightData {
  patternInsights: PatternInsight[];
}

export interface PatternInsight {
  element: string;
  elementType: string;
  performance: {
    uplift: number;
    withElement: {
      ctr: number;
      sampleSize: number;
    };
    withoutElement: {
      ctr: number;
      sampleSize: number;
    };
    confidence: number;
  };
}
