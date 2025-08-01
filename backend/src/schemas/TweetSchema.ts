import mongoose, { Schema, Document } from 'mongoose';

export interface ITweet extends Document {
  twitterId?: string;
  tweetText: string;
  authorName: string;
  username: string;
  isVerified: boolean;
  verifiedType: string;
  profilePicture: string;
  tweetUrl: string;
  mediaPreviewUrl?: string;
  mediaType?: string;
  topics: string[];
  createdAt: string;
  createdAtDate: Date;
  updatedAt: Date;
}

const TweetSchema: Schema = new Schema({
  twitterId: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values
  },
  tweetText: {
    type: String,
    required: true,
    trim: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedType: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
  },
  profilePicture: {
    type: String,
    required: true,
    trim: true
  },
  tweetUrl: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  mediaPreviewUrl: {
    type: String,
    trim: true
  },
  mediaType: {
    type: String,
    trim: true,
    enum: ['photo', 'video', 'animated_gif', '']
  },
  topics: {
    type: [String],
    default: [],
    trim: true
  },
  createdAt: {
    type: String,
    required: true
  },
  createdAtDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'tweets'
});

// Indexes for better query performance
TweetSchema.index({ username: 1 });
TweetSchema.index({ createdAtDate: -1 });
TweetSchema.index({ isVerified: 1 });
TweetSchema.index({ tweetUrl: 1 }, { unique: true });
TweetSchema.index({ twitterId: 1 }, { unique: true, sparse: true });

// Text index for search functionality
TweetSchema.index({ 
  tweetText: 'text', 
  authorName: 'text', 
  username: 'text' 
});

// Virtual for formatted date
TweetSchema.virtual('formattedCreatedAt').get(function(this: ITweet) {
  return new Date(this.createdAt).toISOString();
});

// Ensure virtual fields are serialized
TweetSchema.set('toJSON', { virtuals: true });
TweetSchema.set('toObject', { virtuals: true });

export const Tweet = mongoose.model<ITweet>('Tweet', TweetSchema); 