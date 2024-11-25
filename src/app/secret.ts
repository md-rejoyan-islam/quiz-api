import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || "development",
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
};
