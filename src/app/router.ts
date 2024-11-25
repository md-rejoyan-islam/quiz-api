import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import errorHandler from "../middlewares/error-handler";
import authRouter from "../routes/auth.routes";
import adminQuizRouter from "../routes/quiz.admin.routes";
import quizRouter from "../routes/quiz.routes";
import AppError from "../utils/app-errors";
import { successResponse } from "../utils/response-handler";

const router = Router();

// home route
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    successResponse(res, {
      statusCode: 200,
      message: "Welcome to the Quiz App API",
    });
  })
);

// health check
router.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    successResponse(res, {
      statusCode: 200,
      message: "Server is healthy",
    });
  })
);

// API routes
router.use("/api/v1/auth", authRouter);
router.use("/api/v1/quizzes", quizRouter);
router.use("/api/v1/admin", adminQuizRouter);

// 404 route
router.all(
  "*",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw AppError.notFound(`Can't find ${req.originalUrl} on this server!`);
    // next(AppError.notFound(`Can't find ${req.originalUrl} on this server!`));
  })
);

// Global error handling middleware
router.use(errorHandler);

export default router;
