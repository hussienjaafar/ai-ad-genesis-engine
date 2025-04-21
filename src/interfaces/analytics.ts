
// No need for mongoose import at the TypeScript interface level
// Using plain TypeScript interfaces instead

export interface DailyPerformance {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
  ctr: number;
  cpc: number;
  cpl: number;
  conversions?: number;
}

export interface PerformanceMetrics {
  kpis: {
    spend: number;
    roas: number;
    ctr: number;
    cpl: number;
    cpc?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
  };
  totals?: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    ctr: number; // Adding the missing ctr property
    conversions?: number;
  };
  daily: DailyPerformance[];
}

export interface PatternInsight {
  _id?: string;
  element: string;
  elementType: string;
  performance: {
    withElement: {
      impressions: number;
      clicks: number;
      ctr: number;
      sampleSize: number;
    };
    withoutElement: {
      impressions: number;
      clicks: number;
      ctr: number;
      sampleSize: number;
    };
    uplift: number;
    confidence: number;
  };
}

export interface InsightData {
  patternInsights: PatternInsight[];
  businessId: string;
  createdAt: string;
}

// Add DailyMetric to fix the error in PerformanceChart.tsx
export interface DailyMetric {
  date: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  ctr?: number;
  cpc?: number;
  cpl?: number;
  roas?: number;
  // Make all properties optional to be safe
}
