import { ROLE } from "@prisma/client";
import { Router } from "express";
import questionController from "../controllers/question.controller";
import quizController from "../controllers/quiz.controller";
import { authorize } from "../middlewares/authorize";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import quizValidator from "../validators/quiz.validator";

const quizRouter = Router();

// create a new quiz set
quizRouter.post(
  "/",
  verify.isLoggedIn,
  authorize([ROLE.ADMIN]),
  [validate(quizValidator.createQuizSchema)],
  quizController.createQuizSet
);

// get all quizzes which are published
quizRouter.get("/", quizController.getAllQuizzSets);

// Get quiz by quiz id
quizRouter.get("/:id", quizController.getQuizSetById);

// update quiz by quiz id
quizRouter.put("/:id", verify.isLoggedIn, quizController.updateQuizSetById);

// delete quiz by quiz id
quizRouter.delete("/:id", verify.isLoggedIn, quizController.deleteQuizSetById);

//publish quiz by quiz id
quizRouter.put(
  "/:id/publish",
  verify.isLoggedIn,
  quizController.publishedQuizSetById
);

// get quiz attempts by quiz id
quizRouter.get(
  "/:id/attempts",
  verify.isLoggedIn,
  quizController.getQuizAttemptsByQuizId
);

// attempt quiz by quiz id
quizRouter.post(
  "/:id/attempt",
  [verify.isLoggedIn, validate(quizValidator.submitAttemptSchema)],
  quizController.attemptQuizSetById
);

// rate quiz by quiz id
quizRouter.post("/:id/rate", verify.isLoggedIn, quizController.rateQuizSetById);

// get all questions by quiz id
quizRouter.get(
  "/:id/questions",
  verify.isLoggedIn,
  questionController.getQuestionsByQuizSetId
);

// create a new question for a quiz
quizRouter.post(
  "/:id/questions",
  [verify.isLoggedIn, validate(quizValidator.createQuestionSchema)],
  questionController.createQuestion
);

// bulk create questions for a quiz
quizRouter.post(
  "/:id/questions/bulk",
  [verify.isLoggedIn, validate(quizValidator.submitAttemptSchema)],
  questionController.createBulkQuestions
);

// // get quiz leaderboard by quiz id
// quizRouter.get(
//   "/:quizId/leaderboard",
//   verify.isLoggedIn,
//   quizController.getQuizLeaderboardByQuizId
// );

export default quizRouter;
