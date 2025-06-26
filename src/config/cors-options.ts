import dotenv from "dotenv";
dotenv.config();

import { CorsOptions } from "cors";

// whitelist is an array of URLs that are allowed to access the API
const whitelist: string[] = (process.env.CORS_WHITELIST || "").split(",");

// corsOptions is an object with a function that checks if the origin is in the whitelist
const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if ((origin && whitelist.includes(origin)) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

// export the corsOptions object
export default corsOptions;
