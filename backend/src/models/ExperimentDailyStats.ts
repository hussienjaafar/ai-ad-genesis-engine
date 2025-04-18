
import { Schema, model, Document } from 'mongoose';

export interface ExperimentDailyStatsDocument extends Document {
  experimentId: Schema.Types.ObjectId;
  date: string;
  original: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  variant: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

const ExperimentDailyStatsSchema = new Schema<ExperimentDailyStatsDocument>({
  experimentId: { type: Schema.Types.ObjectId, ref: 'Experiment', required: true },
  date: { type: String, required: true },
  original: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  },
  variant: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Create a compound index for efficient lookups
ExperimentDailyStatsSchema.index({ experimentId: 1, date: 1 }, { unique: true });

export default model<ExperimentDailyStatsDocument>(
  'ExperimentDailyStats', 
  ExperimentDailyStatsSchema
);
