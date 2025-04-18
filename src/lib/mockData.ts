
import { 
  BusinessProfile, 
  AdPlatform, 
  PerformanceMetric, 
  AdInsight, 
  AdContent,
  GeneratedAd,
  Activity
} from "../interfaces/types";

export const mockBusinessProfile: BusinessProfile = {
  id: "bp-001",
  name: "Sample Business",
  industry: "ecommerce",
  description: "An online store selling premium handcrafted home goods.",
  brandVoice: {
    tone: "Professional, warm, inspiring",
    keywords: ["handcrafted", "premium", "sustainable", "artisan"],
    avoidWords: ["cheap", "generic", "mass-produced"],
  },
  targetAudience: {
    demographics: ["25-45", "high income", "urban"],
    interests: ["home decor", "sustainable living", "interior design"],
    painPoints: ["lack of unique items", "poor quality products", "environmental concerns"],
  },
  isOnboarded: false
};

export const mockAdPlatforms: AdPlatform[] = [
  {
    id: "plat-001",
    name: "facebook",
    isConnected: false,
    lastSynced: null
  },
  {
    id: "plat-002",
    name: "google",
    isConnected: false,
    lastSynced: null
  },
  {
    id: "plat-003",
    name: "tiktok",
    isConnected: false,
    lastSynced: null
  },
  {
    id: "plat-004",
    name: "linkedin",
    isConnected: false,
    lastSynced: null
  }
];

export const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    id: "metric-001",
    name: "Total Impressions",
    value: 125430,
    change: 12.5,
    unit: "number",
    isPositiveGood: true
  },
  {
    id: "metric-002",
    name: "Total Clicks",
    value: 5247,
    change: 8.3,
    unit: "number",
    isPositiveGood: true
  },
  {
    id: "metric-003",
    name: "Conversion Rate",
    value: 2.7,
    change: -0.5,
    unit: "percentage",
    isPositiveGood: true
  },
  {
    id: "metric-004",
    name: "Cost per Click",
    value: 1.24,
    change: -0.15,
    unit: "currency",
    currency: "USD",
    isPositiveGood: false
  },
  {
    id: "metric-005",
    name: "Total Spend",
    value: 6506.28,
    change: 5.2,
    unit: "currency",
    currency: "USD",
    isPositiveGood: false
  },
  {
    id: "metric-006",
    name: "ROAS",
    value: 3.8,
    change: 0.4,
    unit: "number",
    isPositiveGood: true
  }
];

export const mockAdInsights: AdInsight[] = [
  {
    id: "insight-001",
    title: "Top performing headline identified",
    description: "Ads with 'Limited Time Offer' are performing 45% better than other headlines.",
    impact: "high",
    type: "opportunity",
    actionable: true
  },
  {
    id: "insight-002",
    title: "Weekend performance drop",
    description: "Your ads are showing 23% lower engagement on weekends.",
    impact: "medium",
    type: "issue",
    actionable: true
  },
  {
    id: "insight-003",
    title: "New audience segment opportunity",
    description: "Similar businesses are seeing success targeting 'Urban Professionals' segment.",
    impact: "medium",
    type: "opportunity",
    actionable: true
  },
  {
    id: "insight-004",
    title: "Video content outperforming images",
    description: "Video ads are generating 34% more conversions than image ads at similar cost.",
    impact: "high",
    type: "information",
    actionable: true
  }
];

export const mockAdContents: AdContent[] = [
  {
    id: "ad-001",
    platform: "facebook",
    type: "image",
    headline: "Transform Your Space with Handcrafted Excellence",
    description: "Our premium artisan-made home goods bring sustainable luxury to your living spaces. Shop our new collection today!",
    callToAction: "Shop Now",
    imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    performance: {
      impressions: 28450,
      clicks: 1245,
      conversions: 37,
      spend: 1520,
      ctr: 4.38,
      cpc: 1.22,
      roas: 3.2
    },
    createdAt: "2025-04-10T15:30:00Z"
  },
  {
    id: "ad-002",
    platform: "google",
    type: "text",
    headline: "Handcrafted Home Goods - Premium Quality",
    description: "Discover artisan-crafted home decor. Sustainable & unique pieces for your home.",
    callToAction: "Shop Collection",
    performance: {
      impressions: 45678,
      clicks: 1879,
      conversions: 42,
      spend: 1890.50,
      ctr: 4.11,
      cpc: 1.01,
      roas: 3.5
    },
    createdAt: "2025-04-12T09:15:00Z"
  },
  {
    id: "ad-003",
    platform: "facebook",
    type: "carousel",
    headline: "Spring Collection 2025 - Handcrafted Beauty",
    description: "Explore our new sustainable home goods collections. Artisan quality, timeless designs.",
    callToAction: "View Collection",
    imageUrl: "https://images.unsplash.com/photo-1493376489153-9d6be436c937?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    performance: {
      impressions: 32560,
      clicks: 1380,
      conversions: 41,
      spend: 1678.25,
      ctr: 4.24,
      cpc: 1.22,
      roas: 3.8
    },
    createdAt: "2025-04-14T11:45:00Z"
  }
];

export const mockGeneratedAds: GeneratedAd[] = [
  {
    id: "gen-001",
    platform: "facebook",
    type: "image",
    headline: "Elevate Your Home with Artisan Craftsmanship",
    description: "Discover our handcrafted home decor pieces that combine sustainability with luxury. Each item tells a story of artisan dedication and environmental responsibility.",
    callToAction: "Shop Collection",
    imagePrompt: "A beautifully arranged living room with handcrafted wooden furniture, ceramic vases with plants, and natural light coming through large windows, creating a warm and inviting atmosphere.",
    industry: "ecommerce",
    createdAt: "2025-04-16T10:30:00Z"
  },
  {
    id: "gen-002",
    platform: "google",
    type: "text",
    headline: "Sustainable Luxury for Modern Homes",
    description: "Premium handcrafted decor that transforms spaces while respecting our planet. Discover pieces that last generations.",
    callToAction: "Explore Now",
    industry: "ecommerce",
    createdAt: "2025-04-16T10:35:00Z"
  }
];

export const mockActivities: Activity[] = [
  {
    id: "act-001",
    type: "ad_created",
    description: "Generated new Facebook image ad",
    timestamp: "2025-04-16T10:30:00Z",
    relatedItemId: "gen-001",
    relatedItemType: "ad"
  },
  {
    id: "act-002",
    type: "ad_created",
    description: "Generated new Google text ad",
    timestamp: "2025-04-16T10:35:00Z",
    relatedItemId: "gen-002",
    relatedItemType: "ad"
  },
  {
    id: "act-003",
    type: "insight_generated",
    description: "New performance insight: Top performing headline identified",
    timestamp: "2025-04-16T09:15:00Z",
    relatedItemId: "insight-001",
    relatedItemType: "insight"
  }
];

export const industryOptions = [
  { value: "ecommerce", label: "E-commerce / Retail" },
  { value: "real_estate", label: "Real Estate" },
  { value: "healthcare", label: "Healthcare" },
  { value: "professional_services", label: "Professional Services" },
  { value: "local_business", label: "Local Business" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "travel", label: "Travel & Hospitality" },
  { value: "food_beverage", label: "Food & Beverage" }
];
