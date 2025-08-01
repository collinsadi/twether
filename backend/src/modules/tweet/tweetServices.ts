import { twitterApi } from "../../common/config/twitterApi";
import * as fs from "fs";
import * as path from "path";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  createdAt?: string;
  author_id?: string;
  author?: {
    id: string;
    name: string;
    userName: string;
    verified: boolean;
    isBlueVerified: boolean;
    isVerified: boolean;  
    verifiedType: string;
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    description: string;
    location: string;
    profileImageUrl: string;
    profilePicture?: string;
  };
  url?: string;
  twitterUrl?: string;
  lang?: string;
  source?: string;
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  quoteCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
  isReply?: boolean;
  inReplyToId?: string;
  conversationId?: string;
  inReplyToUserId?: string;
  inReplyToUsername?: string;
  entities?: {
    urls?: Array<{ url: string; display_url: string }>;
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
    media?: Array<{ type: string; url: string }>;
  };
  extendedEntities?: {
    media?: Array<{
      type: string;
      media_url_https: string;
      url: string;
    }>;
  };
  quoted_tweet?: {
    text: string;
    author?: { username: string };
  };
  retweeted_tweet?: {
    text: string;
    author?: { username: string };
  };
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface SimplifiedTweet {
  tweetText: string;
  authorName: string;
  username: string;
  isVerified: boolean;
  verifiedType: string; 
  profilePicture: string;
  tweetUrl: string;
  mediaPreviewUrl?: string;
  mediaType?: string;
  createdAt: string;
}

export class TweetMonitoringService {
  private static instance: TweetMonitoringService;

  private constructor() {}

  public static getInstance(): TweetMonitoringService {
    if (!TweetMonitoringService.instance) {
      TweetMonitoringService.instance = new TweetMonitoringService();
    }
    return TweetMonitoringService.instance;
  }

  /**
   * Read users from users.json file
   */
  private readUsersFromFile(): string[] {
    try {
      const usersPath = path.join(__dirname, "../../users.json");
      const usersData = fs.readFileSync(usersPath, "utf8");
      return JSON.parse(usersData);
    } catch (error) {
      console.error("Error reading users.json:", error);
      return [];
    }
  }

  /**
   * Extract simplified tweet data with only required fields
   */
  private extractSimplifiedTweetData(tweet: Tweet): SimplifiedTweet {
    const author = tweet.author;
    const media = tweet.extendedEntities?.media?.[0];

    return {
      tweetText: tweet.text,
      authorName: author?.name || "",
      username: author?.userName || "",
      isVerified: author?.isBlueVerified || author?.isVerified || false,
      verifiedType: author?.verifiedType || "",
      profilePicture: author?.profilePicture || author?.profileImageUrl || "",
      tweetUrl: tweet.twitterUrl || tweet.url || "",
      mediaPreviewUrl: media?.media_url_https,
      mediaType: media?.type,
      createdAt: tweet.createdAt || "",
    };
  }

  /**
   * Get tweets for users from users.json file with simplified data
   */
  public async getTweetsForUsers(): Promise<SimplifiedTweet[]> {
    const users = this.readUsersFromFile();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const allTweets: SimplifiedTweet[] = [];

    await Promise.all(
      users.map(async (user) => {
        try {
          const query = `from:${user} since:${twoHoursAgo.toISOString()}`;
          const response = await twitterApi.get(`/advanced_search`, {
            params: {
              query,
              queryType: "Latest",
            },
          });

          console.log(`Tweets for ${user}:`, response.data);

          const tweets = response.data.tweets || [];
          const simplifiedTweets = tweets.map((tweet: Tweet) =>
            this.extractSimplifiedTweetData(tweet)
          );

          allTweets.push(...simplifiedTweets);
        } catch (error) {
          console.error(`Error fetching tweets for ${user}:`, error);
        }
      })
    );

    return allTweets;
  }
}

// Export singleton instance
export const tweetMonitoringService = TweetMonitoringService.getInstance();
