import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || "development",
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: +process.env.JWT_ACCESS_EXPIRES_IN!,
    refreshTokenExpiresIn: +process.env.JWT_REFRESH_EXPIRES_IN!,
  },
  clientUrl: process.env.CLIENT_URL!,
};
