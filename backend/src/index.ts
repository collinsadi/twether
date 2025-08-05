import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { ENVIRONMENT } from "./common/config/environment";
import { connectDb } from "./common/config/database";
import cors from "cors";
import tweetRoutes from "./modules/tweet/tweetRoutes";
import cron from "node-cron";
import { TweetMonitoringService } from "./modules/tweet/tweetServices";
import logger from "./common/resources/logger";

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(express.static("src/common/public"));
app.use(cors());
app.use(express.json());

// Initialize services
const tweetService = TweetMonitoringService.getInstance();

// Set Socket.IO instance for real-time emissions
tweetService.setSocketIO(io);

// Setup cron job to fetch tweets every 10 minutes (only if RUN_CRON is true)
const shouldRunCron = process.env.RUN_CRON === "true";

if (shouldRunCron) {
  cron.schedule(
    "*/10 * * * *",
    async () => {
      logger.info("🔄 Running scheduled tweet fetch...");
      try {
        const tweets = await tweetService.getTweetsForUsers();
        logger.info(
          `✅ Scheduled fetch completed. Found ${tweets.length} tweets.`
        );
      } catch (error) {
        logger.error("❌ Error in scheduled tweet fetch:", error);
      }
    },
    {
      timezone: "UTC",
    }
  );

  logger.info("⏰ Cron job scheduled: Tweet fetching every 10 minutes");
} else {
  logger.info(
    '⏰ Cron job disabled: RUN_CRON environment variable is not set to "true"'
  );
}

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Twether API is running" });
});

// Tweet routes
app.use("/api/tweets", tweetRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.info(`🔌 Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`🔌 Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(ENVIRONMENT.APP.PORT, async () => {
  logger.info(
    `${ENVIRONMENT.APP.NAME} Running on http://localhost:${ENVIRONMENT.APP.PORT}`
  );

  // Connect to database
  try {
    await connectDb();
    logger.info("✅ Database connected successfully");
  } catch (error) {
    logger.error("❌ Failed to connect to database:", error);
  }
});
