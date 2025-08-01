import { Router, Request, Response } from "express";
import tweetController from "./tweetController";

const router = Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Tweet API is running" });
});

// Get tweets from database with pagination and filtering
router.get("/", tweetController.getTweets);

// Manually trigger tweet fetching (for testing)
router.post("/fetch", tweetController.fetchTweets);

// Get available topics
router.get("/topics", tweetController.getTopics);



export default router;
