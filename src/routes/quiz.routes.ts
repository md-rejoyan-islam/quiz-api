import { Router } from "express";
import quizController from "../controllers/quiz.controller";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import { submitAttemptSchema } from "../validators/quiz.validator";

// Create a new quizRouter instance
const quizRouter = Router();

// Leaderboard routes should be at the top to avoid conflicting with :id routes
quizRouter.get(
  "/:quizId/leaderboard",
  verify.isLoggedIn,
  quizController.getQuizLeaderboardByQuizId
);

// Get user attempts route
quizRouter.get("/attempts", verify.isLoggedIn, quizController.getAttempts);

// get all quizzes which are published
quizRouter.get("/", quizController.listQuizzes);

// Get quiz by user id
quizRouter.get("/:id", verify.isLoggedIn, quizController.getQuiz);

// Submit quiz attempt for a quiz
quizRouter.post(
  "/:quizId/attempt",
  [verify.isLoggedIn, validate(submitAttemptSchema)],
  quizController.submitAttempt
);

// Get quiz attempts by quiz id
quizRouter.get(
  "/:quizId/attempts",
  verify.isLoggedIn,
  quizController.getQuizAttemptsByQuizId
);

export default quizRouter;
