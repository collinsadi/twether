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
    const tweets = await tweetMonitoringService.getTweetsForUsers();
    res.json(tweets);
  }
}

export default TweetController.getInstance();
