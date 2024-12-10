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
  "/",
  authorize([UserRole.ADMIN]),
  quizController.listQuizzesForAdmin
);

adminQuizRouter.post(
  "/",
  [validate(createQuizSchema)],
  quizController.createQuiz
);

adminQuizRouter.patch(
  "/:id",
  [verifyQuizOwnership, validate(updateQuizSchema)],
  quizController.updateQuiz
);

adminQuizRouter.delete("/:quizId", quizController.deleteQuizSet);

adminQuizRouter.post(
  "/:quizId/questions",
  [validate(createQuestionSchema)],
  quizController.addQuestion
);

adminQuizRouter.post(
  "/:quizId/questions/bulk",
  [validate(createBulkQuestionsSchema)],
  quizController.addBulkQuestions
);

adminQuizRouter.delete("/questions/:questionId", quizController.deleteQuestion);

adminQuizRouter.patch("/questions/:questionId", quizController.editQuestion);

export default adminQuizRouter;
