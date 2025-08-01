import * as dotenv from "dotenv";
dotenv.config();

export const ENVIRONMENT = {
  APP: {
    NAME: process.env.APP_NAME,
    PORT: process.env.PORT || 3000,
    ENV: process.env.APP_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  DB: {
    URL: process.env.DB_URL,
  },
  TWITTER: {
    API_KEY: process.env.TWITTER_API_KEY,
  }
};
