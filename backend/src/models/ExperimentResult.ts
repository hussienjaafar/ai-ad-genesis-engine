
import mongoose, { Schema, Document } from 'mongoose';

export interface ExperimentResultDocument extends Document {
  experimentId: mongoose.Types.ObjectId;
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
  lastUpdated: Date;
}

const ExperimentResultSchema = new Schema({
  experimentId: {
    type: Schema.Types.ObjectId,
    ref: 'Experiment',
    required: true,
    unique: true
  },
  results: {
    original: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    },
    variant: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    }
  },
  lift: {
    type: Number,
    default: 0
  },
  pValue: {
    type: Number,
    default: 1
  },
  isSignificant: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const ExperimentResultModel = mongoose.model<ExperimentResultDocument>('ExperimentResult', ExperimentResultSchema);

export default ExperimentResultModel;
