import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { ENVIRONMENT } from "./common/config/environment";
import { connectDb } from "./common/config/database";
import cors from "cors";


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




httpServer.listen(ENVIRONMENT.APP.PORT, async () => {
  console.log(
    `${ENVIRONMENT.APP.NAME} Running on http://localhost:${ENVIRONMENT.APP.PORT}`
  );

  connectDb();
});
