import mongoose, { Schema, Document } from 'mongoose';

export interface ILastChecked extends Document {
  username: string;
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LastCheckedSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  lastCheckedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'last_checked_times'
});

// Indexes for better query performance
LastCheckedSchema.index({ lastCheckedAt: -1 });

export const LastChecked = mongoose.model<ILastChecked>('LastChecked', LastCheckedSchema); 