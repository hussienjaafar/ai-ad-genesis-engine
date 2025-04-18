
export interface Experiment {
  _id: string;
  businessId: string;
  name: string;
  contentIdOriginal: string;
  contentIdVariant: string;
  split: {
    original: number;
    variant: number;
  };
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentResult {
  experimentId: string;
  results: {
    original: {
      impressions: number;
      clicks: number;
      conversions: number;
      conversionRate: number;
    };
    variant: {
      impressions: number;
      clicks: number;
      conversions: number;
      conversionRate: number;
    };
  };
  lift: number;
  pValue: number;
  isSignificant: boolean;
  lastUpdated: string;
}

export interface CreateExperimentDto {
  name: string;
  contentIdOriginal: string;
  contentIdVariant: string;
  split?: {
    original: number;
    variant: number;
  };
  startDate: string;
  endDate: string;
}
