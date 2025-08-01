import { Request, Response } from "express";
import { Tweet } from "../../schemas/TweetSchema";

class TweetController {
  private static instance: TweetController;

  private constructor() {}

  public static getInstance(): TweetController {
    if (!TweetController.instance) {
      TweetController.instance = new TweetController();
    }
    return TweetController.instance;
  }

  async getTweets(req: Request, res: Response) {
    try {
      // Get query parameters for pagination and filtering
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const topic = req.query.topic as string;

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Build query filter
      const filter: any = {};
      if (topic && topic !== "all") {
        // Check if the topic exists in the topics array (case-insensitive)
        filter.topics = {
          $elemMatch: {
            $regex: new RegExp(`^${topic}$`, "i"),
          },
        };
      }

      console.log("🔍 Filter:", JSON.stringify(filter, null, 2));
      console.log("📄 Page:", page, "Limit:", limit, "Topic:", topic);

      // Fetch tweets from database with pagination and filtering
      const tweets = await Tweet.find(filter)
        .sort({ createdAtDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      console.log("📊 Found tweets:", tweets.length);

      // Get total count for pagination info
      const totalTweets = await Tweet.countDocuments(filter);
      const totalPages = Math.ceil(totalTweets / limit);

      res.json({
        success: true,
        message: `Successfully fetched ${tweets.length} tweets`,
        data: {
          tweets,
          pagination: {
            currentPage: page,
            totalPages,
            totalTweets,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error in getTweets:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching tweets",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getTopics(req: Request, res: Response) {
    try {
      // Get all unique topics from the database
      const topics = await Tweet.distinct("topics");

      // Filter out empty arrays and flatten the results
      const uniqueTopics = topics
        .filter((topic) => topic && topic.length > 0)
        .flat()
        .filter((topic, index, arr) => arr.indexOf(topic) === index)
        .sort();

      res.json({
        success: true,
        message: `Found ${uniqueTopics.length} unique topics`,
        data: uniqueTopics,
      });
    } catch (error) {
      console.error("Error in getTopics:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching topics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default TweetController.getInstance();
