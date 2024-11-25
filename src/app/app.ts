import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import corsOptions from "../config/cors-options";

import router from "./router";

// Initialize express app
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cors
app.use(cors(corsOptions));

// cookie parser
app.use(cookieParser());

// Routes
app.use(router);

// Export the app instance
export default app;
