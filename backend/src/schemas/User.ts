import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  twitterId: string;
  username: string;
  name: string;
  profilePicture?: string;
  isVerified: boolean;
  lastCheckedAt: Date;
}

const UserSchema: Schema = new Schema({
  twitterId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastCheckedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ twitterId: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ lastCheckedAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema); 