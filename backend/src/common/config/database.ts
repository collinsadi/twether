import mongoose from "mongoose";
import { ENVIRONMENT } from "./environment";
import logger from "../resources/logger";

export const connectDb = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(String(ENVIRONMENT.DB.URL));
    logger.info("MongoDB Connected: " + conn.connection.host);
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error: " + error.message);
    } else {
      logger.error("An unknown error occurred.");
    }
    process.exit(1);
  }
};
