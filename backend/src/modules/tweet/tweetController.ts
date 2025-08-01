import { Request, Response } from "express";
import { tweetMonitoringService } from "./tweetServices";

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
      const tweets = await tweetMonitoringService.getTweetsForUsers();
      res.json({
        success: true,
        message: `Successfully fetched ${tweets.length} new tweets`,
        data: tweets
      });
    } catch (error) {
      console.error('Error in getTweets:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tweets',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }


}

export default TweetController.getInstance();
