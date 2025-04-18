
export interface PerformanceData {
  businessId: string;
  platform: string;
  date: string;
  adId: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
  };
  device?: string;
  audienceSegment?: string;
}

export interface ContentElement {
  type: string;
  value: string;
  metadata?: Record<string, any>;
}

export interface Content {
  _id: string;
  businessId: string;
  contentType: string;
  platform: string;
  adId?: string;
  title: string;
  parsedContent: ContentElement[];
  rawContent: string;
}

export interface PatternInsight {
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
    confidenceInterval?: {
      lower: number;
      upper: number;
    };
  };
}
