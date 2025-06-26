import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import corsOptions from "../config/cors-options";
import router from "./router";
import secret from "./secret";

// Initialize express app
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// morgan only in development
if (secret.env === "development") {
  app.use(require("morgan")("dev"));
}

//cors
app.use(cors(corsOptions));

// cookie parser
app.use(cookieParser());

// Routes
app.use(router);

// Export the app instance
export default app;
