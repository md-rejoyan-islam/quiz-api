import { Router } from "express";
import questionController from "../controllers/question.controller";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import { submitAttemptSchema } from "../validators/quiz.validator";

const questionRouter = Router();

// get all questions by quiz id
questionRouter.get(
  "/:quizId/questions",
  verify.isLoggedIn,
  questionController.getQuestionsByQuizSetId
);

// create a new question for a quiz
questionRouter.post(
  "/:quizId/questions",
  [verify.isLoggedIn, validate(submitAttemptSchema)],
  questionController.createQuestion
);

// bulk create questions for a quiz
questionRouter.post(
  "/:quizId/questions/bulk",
  [verify.isLoggedIn, validate(submitAttemptSchema)],
  questionController.createBulkQuestions
);

// get question by question id
questionRouter.get(
  "/questions/:id",
  verify.isLoggedIn,
  questionController.getQuestionById
);

// update question by question id when quiz set is draft
questionRouter.put(
  "/questions/:id",
  verify.isLoggedIn,
  questionController.updateQuestionById
);

// delete question by question id when quiz set is draft
questionRouter.delete(
  "/questions/:id",
  verify.isLoggedIn,
  questionController.deleteQuestionById
);
