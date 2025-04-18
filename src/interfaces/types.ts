export type Industry = 
  | "ecommerce" 
  | "real_estate" 
  | "healthcare" 
  | "professional_services" 
  | "local_business"
  | "education"
  | "technology"
  | "finance"
  | "travel"
  | "food_beverage";

export interface BusinessProfile {
  id: string;
  name: string;
  industry: Industry;
  description: string;
  brandVoice: {
    tone: string;
    keywords: string[];
    avoidWords: string[];
  };
  targetAudience: {
    demographics: string[];
    interests: string[];
    painPoints: string[];
  };
  isOnboarded: boolean;
}

export interface AdPlatform {
  id: string;
  name: string;
  isConnected: boolean;
  lastSynced?: string;
  needsReauth?: boolean;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  unit: "currency" | "percentage" | "number";
  currency?: string;
  isPositiveGood: boolean;
}

export interface AdInsight {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  type: "opportunity" | "issue" | "information";
  actionable: boolean;
}

export interface AdContent {
  id: string;
  platform: AdPlatform["name"];
  type: "image" | "video" | "carousel" | "text";
  headline?: string;
  description?: string;
  callToAction?: string;
  imageUrl?: string;
  videoUrl?: string;
  performance?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    ctr: number;
    cpc: number;
    roas?: number;
  };
  createdAt: string;
}

export interface GeneratedAd {
  id: string;
  platform: AdPlatform["name"];
  type: "image" | "video" | "carousel" | "text";
  headline: string;
  description: string;
  callToAction: string;
  imagePrompt?: string;
  industry: Industry;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "ad_created" | "platform_connected" | "insight_generated";
  description: string;
  timestamp: string;
  relatedItemId?: string;
  relatedItemType?: "ad" | "platform" | "insight";
}
