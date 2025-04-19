
export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversions?: number;
  costPerConversion?: number;
}

export interface KPI {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  isPositive: boolean;
}

export interface PerformanceMetrics {
  kpis: {
    impressions?: KPI;
    clicks?: KPI;
    ctr?: KPI;
    spend?: KPI;
    conversions?: KPI;
    costPerConversion?: KPI;
  };
  daily: DailyMetric[];
  totals: {
    impressions: number;
    clicks: number;
    spend: number;
    ctr: number;
    leads?: number;
  };
  lastUpdated: string; // ISO date string of when data was last updated
}

export interface PatternInsight {
  _id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'opportunity' | 'issue' | 'information';
  category: string;
  confidence: number;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface InsightData {
  patternInsights: PatternInsight[];
  lastUpdated?: string;
}
