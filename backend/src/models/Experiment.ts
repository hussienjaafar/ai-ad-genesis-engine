
import mongoose, { Schema, Document } from 'mongoose';

export interface ExperimentDocument extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  contentIdOriginal: string;
  contentIdVariant: string;
  split: {
    original: number;
    variant: number;
  };
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentSchema = new Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  contentIdOriginal: {
    type: String,
    required: true
  },
  contentIdVariant: {
    type: String,
    required: true
  },
  split: {
    original: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
      default: 50
    },
    variant: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
      default: 50
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Validation to ensure split adds up to 100
ExperimentSchema.pre('validate', function(next) {
  if (this.split.original + this.split.variant !== 100) {
    this.invalidate('split', 'Split percentages must add up to 100%');
  }
  next();
});

// Index for quick lookups of active experiments
ExperimentSchema.index({ businessId: 1, status: 1 });

const ExperimentModel = mongoose.model<ExperimentDocument>('Experiment', ExperimentSchema);

export default ExperimentModel;
