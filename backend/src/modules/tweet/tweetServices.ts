import { twitterApi } from "../../common/config/twitterApi";
import * as fs from "fs";
import * as path from "path";
import { Tweet } from "../../schemas/TweetSchema";
import { LastChecked } from "../../schemas/LastCheckedSchema";
import { analyzeTweet } from "../llm/gemini";
import { Server as SocketIOServer } from "socket.io";

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
  topics: string[];
  createdAt: string;
}

export class TweetMonitoringService {
  private static instance: TweetMonitoringService;
  private usersCache: string[] | null = null;
  private lastCheckedCache: Map<string, Date> = new Map();
  private rateLimitDelay = 1000; // 1 second delay between API calls
  private batchSize = 10; // Process tweets in batches for AI analysis
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): TweetMonitoringService {
    if (!TweetMonitoringService.instance) {
      TweetMonitoringService.instance = new TweetMonitoringService();
    }
    return TweetMonitoringService.instance;
  }

  /**
   * Set Socket.IO instance for real-time emissions
   */
  public setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  /**
   * Emit tweet to connected clients
   */
  private emitTweet(tweet: SimplifiedTweet): void {
    if (this.io) {
      this.io.emit('newTweet', tweet);
      console.log(`📡 Emitted new tweet: ${tweet.tweetText.substring(0, 50)}...`);
    }
  }

  /**
   * Read users from users.json file with caching
   */
  private readUsersFromFile(): string[] {
    if (this.usersCache) {
      return this.usersCache;
    }

    try {
      // Try multiple possible paths for different environments
      const possiblePaths = [
        path.join(__dirname, "../../users.json"), // Development: src/modules/tweet -> src/
        path.join(__dirname, "../users.json"),    // Production: dist/modules/tweet -> dist/
        path.join(process.cwd(), "src/users.json"), // Fallback: project root -> src/
        path.join(process.cwd(), "dist/users.json"), // Fallback: project root -> dist/
      ];

      let usersData: string | null = null;
      let usedPath: string | null = null;

      for (const filePath of possiblePaths) {
        try {
          if (fs.existsSync(filePath)) {
            usersData = fs.readFileSync(filePath, "utf8");
            usedPath = filePath;
            console.log(`✅ Found users.json at: ${filePath}`);
            break;
          }
        } catch (err) {
          // Continue to next path
        }
      }

      if (!usersData) {
        throw new Error(`Could not find users.json in any of the expected locations: ${possiblePaths.join(", ")}`);
      }

      const parsedUsers = JSON.parse(usersData);
      this.usersCache = Array.isArray(parsedUsers) ? parsedUsers : [];
      console.log(`📋 Loaded ${this.usersCache.length} users from ${usedPath}`);
      return this.usersCache;
    } catch (error) {
      console.error("Error reading users.json:", error);
      return [];
    }
  }

  /**
   * Clear users cache (useful for testing or when users.json changes)
   */
  public clearUsersCache(): void {
    this.usersCache = null;
  }

  /**
   * Get or create last checked time for a user with caching
   */
  private async getLastCheckedTime(username: string): Promise<Date> {
    // Check cache first
    if (this.lastCheckedCache.has(username)) {
      return this.lastCheckedCache.get(username)!;
    }

    try {
      let lastChecked = await LastChecked.findOne({ username });

      if (!lastChecked) {
        // If no record exists, create one with a default time (24 hours ago)
        const defaultTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        lastChecked = await LastChecked.create({
          username,
          lastCheckedAt: defaultTime,
        });
        console.log(
          `Created new last checked record for ${username} with default time: ${defaultTime}`
        );
      }

      // Cache the result
      this.lastCheckedCache.set(username, lastChecked.lastCheckedAt);
      return lastChecked.lastCheckedAt;
    } catch (error) {
      console.error(`Error getting last checked time for ${username}:`, error);
      // Fallback to 24 hours ago if there's an error
      const fallbackTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.lastCheckedCache.set(username, fallbackTime);
      return fallbackTime;
    }
  }

  /**
   * Update last checked time for a user and cache
   */
  private async updateLastCheckedTime(username: string): Promise<void> {
    try {
      const newTime = new Date();
      await LastChecked.findOneAndUpdate(
        { username },
        { lastCheckedAt: newTime },
        { upsert: true, new: true }
      );
      // Update cache
      this.lastCheckedCache.set(username, newTime);
      console.log(`Updated last checked time for ${username} to ${newTime}`);
    } catch (error) {
      console.error(`Error updating last checked time for ${username}:`, error);
    }
  }

  /**
   * Rate limiting utility
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format date for Twitter API since parameter
   * Twitter API expects format: YYYY-MM-DD_HH:MM:SS_UTC
   */
  private formatDateForTwitterAPI(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}_UTC`;
  }

  /**
   * Extract simplified tweet data with only required fields
   */
  private extractSimplifiedTweetData(
    tweet: Tweet
  ): SimplifiedTweet & { twitterId?: string } {
    const author = tweet.author;
    const media = tweet.extendedEntities?.media?.[0];

    return {
      twitterId: tweet.id,
      tweetText: tweet.text,
      authorName: author?.name || "",
      username: author?.userName || "",
      isVerified: author?.isBlueVerified || author?.isVerified || false,
      verifiedType: author?.verifiedType || "",
      profilePicture: author?.profilePicture || author?.profileImageUrl || "",
      tweetUrl: tweet.twitterUrl || tweet.url || "",
      mediaPreviewUrl: media?.media_url_https,
      mediaType: media?.type,
      topics: [], // Will be populated after AI analysis
      createdAt: tweet.createdAt || "",
    };
  }

  /**
   * Batch analyze tweets using AI for better performance
   */
  private async batchAnalyzeTweets(tweets: SimplifiedTweet[]): Promise<SimplifiedTweet[]> {
    const filteredTweets: SimplifiedTweet[] = [];
    
    // Process tweets in batches
    for (let i = 0; i < tweets.length; i += this.batchSize) {
      const batch = tweets.slice(i, i + this.batchSize);
      
      // Analyze batch in parallel
      const analysisPromises = batch.map(async (tweet) => {
        try {
          const analysisResult = await analyzeTweet(tweet.tweetText);
          const analysis = JSON.parse(analysisResult);

          // logging the analysis result so that it can be viewwed from my VPS
          console.log(analysis);

          // Check if tweet meets criteria
          if (
            analysis.impact !== "low" &&
            analysis.topics &&
            analysis.topics.length > 0 &&
            (analysis.sentiment === "positive" || analysis.sentiment === "neutral")
          ) {
            tweet.topics = analysis.topics;
            
            // Emit tweet in real-time when it matches criteria
            this.emitTweet(tweet);
            
            return tweet;
          }
          return null;
        } catch (error) {
          console.error(`Error analyzing tweet:`, error);
          return null;
        }
      });

      // Wait for batch analysis to complete
      const results = await Promise.all(analysisPromises);
      const validTweets = results.filter(tweet => tweet !== null) as SimplifiedTweet[];
      filteredTweets.push(...validTweets);

      // Add delay between batches to avoid rate limiting
      if (i + this.batchSize < tweets.length) {
        await this.delay(500);
      }
    }

    return filteredTweets;
  }

  /**
   * Batch insert tweets with error handling
   */
  private async batchInsertTweets(tweets: SimplifiedTweet[]): Promise<void> {
    if (tweets.length === 0) return;

    try {
      // Use bulkWrite for better performance
      const operations = tweets.map(tweet => ({
        insertOne: {
          document: tweet
        }
      }));

      await Tweet.bulkWrite(operations, {
        ordered: false, 
        writeConcern: { w: 1 }
      });

      console.log(`Successfully inserted ${tweets.length} tweets in batch`);
    } catch (error: any) {
      if (error.code === 11000) {
        console.log(`Some tweets were already in the database (duplicate key error)`);
      } else {
        console.error(`Error batch inserting tweets:`, error);
      }
    }
  }

  /**
   * Fetch tweets for a single user with rate limiting
   */
  private async fetchTweetsForUser(user: string): Promise<SimplifiedTweet[]> {
    try {
      // Get the last checked time for this user
      const lastCheckedTime = await this.getLastCheckedTime(user);
      const sinceDate = this.formatDateForTwitterAPI(lastCheckedTime);

      const query = `from:${user} since:${sinceDate}`;
      console.log(
        `Querying tweets for ${user} since ${sinceDate} (last checked: ${lastCheckedTime})`
      );

      const response = await twitterApi.get(`/advanced_search`, {
        params: {
          query,
          queryType: "Latest",
        },
      });

      const tweets = response.data.tweets || [];
      console.log(`Found ${tweets.length} new tweets for ${user}`);

      if (tweets.length === 0) {
        // Update last checked time even if no tweets found
        await this.updateLastCheckedTime(user);
        return [];
      }

      // Debug: Log the first tweet
      if (tweets.length > 0) {
        console.log(`First tweet for ${user}:`, {
          id: tweets[0].id,
          createdAt: tweets[0].createdAt || tweets[0].created_at,
          text: tweets[0].text?.substring(0, 100) + "...",
        });
      }

      // Extract simplified tweet data
      const simplifiedTweets = tweets.map((tweet: Tweet) =>
        this.extractSimplifiedTweetData(tweet)
      );

      // Batch analyze tweets
      const filteredTweets = await this.batchAnalyzeTweets(simplifiedTweets);

      // Update the last checked time for this user
      await this.updateLastCheckedTime(user);

      return filteredTweets;
    } catch (error) {
      console.error(`Error fetching tweets for ${user}:`, error);
      return [];
    }
  }

  /**
   * Get tweets for users from users.json file with optimized performance
   * Only fetches tweets newer than the last checked time for each user
   */
  public async getTweetsForUsers(): Promise<SimplifiedTweet[]> {
    const users = this.readUsersFromFile();
    const allTweets: SimplifiedTweet[] = [];

    // Process users in parallel with rate limiting
    const userBatches = [];
    for (let i = 0; i < users.length; i += 3) { // Process 3 users at a time
      userBatches.push(users.slice(i, i + 3));
    }

    for (const batch of userBatches) {
      // Process batch in parallel
      const batchPromises = batch.map(async (user) => {
        const tweets = await this.fetchTweetsForUser(user);
        return tweets;
      });

      const batchResults = await Promise.all(batchPromises);
      
      // Flatten results
      const batchTweets = batchResults.flat();
      allTweets.push(...batchTweets);

      // Add delay between batches to avoid rate limiting
      if (userBatches.indexOf(batch) < userBatches.length - 1) {
        await this.delay(this.rateLimitDelay);
      }
    }

    // Batch insert all tweets at once
    if (allTweets.length > 0) {
      await this.batchInsertTweets(allTweets);
    }

    console.log(`Total tweets processed: ${allTweets.length}`);
    return allTweets;
  }

  /**
   * Get last checked times for all monitored users
   */
  public async getLastCheckedTimes(): Promise<
    { username: string; lastCheckedAt: Date }[]
  > {
    try {
      const lastCheckedRecords = await LastChecked.find({}).sort({
        lastCheckedAt: -1,
      });
      return lastCheckedRecords.map((record) => ({
        username: record.username,
        lastCheckedAt: record.lastCheckedAt,
      }));
    } catch (error) {
      console.error("Error getting last checked times:", error);
      return [];
    }
  }

  /**
   * Reset last checked time for a specific user (useful for testing or manual resets)
   */
  public async resetLastCheckedTime(
    username: string,
    resetTo?: Date
  ): Promise<void> {
    try {
      const resetDate = resetTo || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
      await LastChecked.findOneAndUpdate(
        { username },
        { lastCheckedAt: resetDate },
        { upsert: true, new: true }
      );
      console.log(`Reset last checked time for ${username} to ${resetDate}`);
    } catch (error) {
      console.error(
        `Error resetting last checked time for ${username}:`,
        error
      );
    }
  }

  /**
   * Test API query with different date formats to debug the since parameter
   */
  public async testApiQuery(username: string): Promise<any> {
    try {
      const lastCheckedTime = await this.getLastCheckedTime(username);

      // Test different date formats
      const formats = [
        this.formatDateForTwitterAPI(lastCheckedTime), // YYYY-MM-DD_HH:MM:SS_UTC
        lastCheckedTime.toISOString().split("T")[0], // YYYY-MM-DD
        lastCheckedTime.toISOString().replace("T", "_").replace("Z", "_UTC"),
      ];

      const results = [];

      for (const format of formats) {
        const query = `from:${username} since:${format}`;
        console.log(`Testing query: ${query}`);

        try {
          const response = await twitterApi.get(`/advanced_search`, {
            params: {
              query,
              queryType: "Latest",
            },
          });

          results.push({
            format,
            query,
            tweetCount: response.data.tweets?.length || 0,
            firstTweet: response.data.tweets?.[0]
              ? {
                  id: response.data.tweets[0].id,
                  createdAt:
                    response.data.tweets[0].createdAt ||
                    response.data.tweets[0].created_at,
                  text: response.data.tweets[0].text?.substring(0, 50) + "...",
                }
              : null,
          });
        } catch (error) {
          results.push({
            format,
            query,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        username,
        lastCheckedTime,
        results,
      };
    } catch (error) {
      console.error(`Error testing API query for ${username}:`, error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const tweetMonitoringService = TweetMonitoringService.getInstance();
