
export interface PerformanceMetrics {
  dateRange: string;
  kpis: {
    spend: number;
    roas: number;
    cpl: number;
    ctr: number;
  };
  daily: DailyMetric[];
}

export interface DailyMetric {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number;
  cpl: number;
  roas: number;
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
