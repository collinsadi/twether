import { Router, Request, Response } from "express";
import tweetController from "./tweetController";

const router = Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Tweet API is running" });
});

// Get tweets from Twitter API
router.get("/", tweetController.getTweets);



export default router;
