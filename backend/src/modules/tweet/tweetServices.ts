import { twitterApi } from "../../common/config/twitterApi";
import * as fs from "fs";
import * as path from "path";
import { Tweet } from "../../schemas/TweetSchema";
import { LastChecked } from "../../schemas/LastCheckedSchema";
import { analyzeTweet } from "../llm/gemini";

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
   * Get or create last checked time for a user
   */
  private async getLastCheckedTime(username: string): Promise<Date> {
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

      return lastChecked.lastCheckedAt;
    } catch (error) {
      console.error(`Error getting last checked time for ${username}:`, error);
      // Fallback to 24 hours ago if there's an error
      return new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Update last checked time for a user
   */
  private async updateLastCheckedTime(username: string): Promise<void> {
    try {
      await LastChecked.findOneAndUpdate(
        { username },
        { lastCheckedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log(`Updated last checked time for ${username} to ${new Date()}`);
    } catch (error) {
      console.error(`Error updating last checked time for ${username}:`, error);
    }
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
   * Get tweets for users from users.json file with simplified data
   * Only fetches tweets newer than the last checked time for each user
   */
  public async getTweetsForUsers(): Promise<SimplifiedTweet[]> {
    const users = this.readUsersFromFile();
    const allTweets: SimplifiedTweet[] = [];

    await Promise.all(
      users.map(async (user) => {
        try {
          // Get the last checked time for this user
          const lastCheckedTime = await this.getLastCheckedTime(user);

          // Format the date for Twitter API
          // Try different formats based on Twitter API documentation
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

          // Debug: Log the first few tweets to see their creation dates
          if (tweets.length > 0) {
            console.log(`First tweet for ${user}:`, {
              id: tweets[0].id,
              createdAt: tweets[0].createdAt || tweets[0].created_at,
              text: tweets[0].text?.substring(0, 100) + "...",
            });
          }

          if (tweets.length > 0) {
            const simplifiedTweets = tweets.map((tweet: Tweet) =>
              this.extractSimplifiedTweetData(tweet)
            );

            // AI analysis and filtering of tweets
            const filteredTweets = [];

            for (const tweet of simplifiedTweets) {
              try {
                // Analyze the tweet using Gemini
                const analysisResult = await analyzeTweet(tweet.tweetText);
                const analysis = JSON.parse(analysisResult);

                // Check if tweet meets criteria: impact not "low", topics not empty, and sentiment is positive
                if (
                  analysis.impact !== "low" &&
                  analysis.topics &&
                  analysis.topics.length > 0 &&
                  (analysis.sentiment === "positive" ||
                    analysis.sentiment === "neutral")
                ) {
                  // Update the tweet with the analyzed topics
                  tweet.topics = analysis.topics;
                  filteredTweets.push(tweet);
                  console.log(
                    `Tweet approved for ${user}: ${tweet.tweetText.substring(
                      0,
                      50
                    )}...`
                  );
                } else {
                  console.log(
                    `Tweet filtered out for ${user}: impact=${
                      analysis.impact
                    }, topics=${analysis.topics?.length || 0}, sentiment=${
                      analysis.sentiment
                    }`
                  );
                }
              } catch (error) {
                console.error(`Error analyzing tweet for ${user}:`, error);
                // If analysis fails, skip the tweet
                continue;
              }
            }

            // Add filtered tweets to allTweets
            allTweets.push(...filteredTweets);

            // Insert only filtered tweets with error handling for duplicates
            if (filteredTweets.length > 0) {
              try {
                await Tweet.insertMany(filteredTweets, {
                  ordered: false, // Continue inserting even if some fail
                  rawResult: false,
                });
                console.log(
                  `Successfully inserted ${filteredTweets.length} filtered tweets for ${user}`
                );
              } catch (error: any) {
                if (error.code === 11000) {
                  // Handle duplicate key errors
                  console.log(
                    `Some tweets were already in the database for ${user}`
                  );
                } else {
                  console.error(`Error inserting tweets for ${user}:`, error);
                }
              }
            } else {
              console.log(`No tweets met the criteria for ${user}`);
            }
          }

          // Update the last checked time for this user
          await this.updateLastCheckedTime(user);
        } catch (error) {
          console.error(`Error fetching tweets for ${user}:`, error);
        }
      })
    );

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
