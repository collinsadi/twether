import mongoose, { Schema, Document } from 'mongoose';

export interface ITweet extends Document {
  twitterId: string;
  text: string;
  url: string;
  source: string;
  authorId: mongoose.Types.ObjectId;
  mediaType?: string;
  mediaUrl?: string;
  createdAt: Date;
}

const TweetSchema: Schema = new Schema({
  twitterId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: ''
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mediaType: {
    type: String,
    enum: ['photo', 'video', 'animated_gif', 'audio', null],
    default: null
  },
  mediaUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TweetSchema.index({ authorId: 1, createdAt: -1 });
TweetSchema.index({ createdAt: -1 });
TweetSchema.index({ twitterId: 1 });

// Text index for search functionality
TweetSchema.index({ text: 'text' });

export const Tweet = mongoose.model<ITweet>('Tweet', TweetSchema); 