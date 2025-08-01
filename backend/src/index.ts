import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { ENVIRONMENT } from "./common/config/environment";
import { connectDb } from "./common/config/database";
import cors from "cors";
import tweetRoutes from "./modules/tweet/tweetRoutes";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.static("src/common/public"));
app.use(cors());
app.use(express.json());

// Initialize services

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Twether API is running" });
});

// Tweet routes
app.use("/api/tweets", tweetRoutes);

httpServer.listen(ENVIRONMENT.APP.PORT, async () => {
  console.log(
    `${ENVIRONMENT.APP.NAME} Running on http://localhost:${ENVIRONMENT.APP.PORT}`
  );

  // Connect to database
  try {
    await connectDb();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
  }
});
