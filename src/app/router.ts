import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import errorHandler from "../middlewares/error-handler";
import authRouter from "../routes/auth.routes";
import questionRouter from "../routes/question.routes";
import quizRouter from "../routes/quiz.routes";
import seedRouter from "../routes/seed.routes";
import userRouter from "../routes/user.routes";
import { successResponse } from "../utils/response-handler";

// Load the OpenAPI specification
const swaggerDocument = YAML.load(
  path.join(__dirname, "../../docs/quiz_api_spec.yaml")
);

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
router.use("/api/v1/users", userRouter);
router.use("/api/v1/quiz-sets", quizRouter);
router.use("/api/v1/questions", questionRouter);
router.use("/api/v1/seeds", seedRouter);

// Setup the Swagger UI route
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 route
router.use(
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw createError.NotFound(
      `Can't find ${req.originalUrl} on this servers!`
    );
  })
);

// Global error handling middleware
router.use(errorHandler);

export default router;
