
export interface Agency {
  _id: string;
  name: string;
  ownerUserId: string;
  clientBusinessIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgencyDto {
  name: string;
}

export interface UpdateAgencyClientsDto {
  action: 'add' | 'remove';
  clientBusinessIds: string[];
}

export interface AgencyOverview {
  aggregatedKPIs: {
    totalSpend: number;
    avgCTR: number;
    totalImpressions: number;
    totalClicks: number;
  };
  clientBreakdown: {
    businessId: string;
    businessName: string;
    spend: number;
    impressions: number;
    clicks: number;
  }[];
  activeExperiments: {
    id: string;
    name: string;
    businessId: string;
    businessName: string;
    status: string;
    lift: number;
    confidence: number;
    startDate: string;
  }[];
}
