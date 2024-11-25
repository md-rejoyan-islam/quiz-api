import { Router } from "express";
import quizController from "../controllers/quiz.controller";
import authorize from "../middlewares/authorize";
import verifyQuizOwnership from "../middlewares/quiz-ownership";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import { UserRole } from "../utils/types";
import {
  createBulkQuestionsSchema,
  createQuestionSchema,
  createQuizSchema,
  updateQuizSchema,
} from "../validators/quiz.validator";

const adminQuizRouter = Router();

adminQuizRouter.use(verify.isLoggedIn);

// Admin routes
adminQuizRouter.get(
  "/quizzes",
  authorize([UserRole.ADMIN]),
  quizController.listQuizzesForAdmin
);

adminQuizRouter.post(
  "/quizzes",
  [validate(createQuizSchema)],
  quizController.createQuiz
);

adminQuizRouter.patch(
  "/quizzes/:id",
  [verifyQuizOwnership, validate(updateQuizSchema)],
  quizController.updateQuiz
);

adminQuizRouter.delete("/quizzes/:quizId", quizController.deleteQuizSet);

adminQuizRouter.post(
  "/quizzes/:quizId/questions",
  [validate(createQuestionSchema)],
  quizController.addQuestion
);

adminQuizRouter.post(
  "/quizzes/:quizId/questions/bulk",
  [validate(createBulkQuestionsSchema)],
  quizController.addBulkQuestions
);

adminQuizRouter.delete(
  "/questions/:questionId",

  quizController.deleteQuestion
);

adminQuizRouter.patch("/questions/:questionId", quizController.editQuestion);

export default adminQuizRouter;
