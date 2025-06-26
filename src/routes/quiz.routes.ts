import { Router } from "express";
import quizController from "../controllers/quiz.controller";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import { submitAttemptSchema } from "../validators/quiz.validator";

const quizRouter = Router();

// create a new quiz set
quizRouter.post("/", quizController.createQuizSet);

// get all quizzes which are published
quizRouter.get("/", quizController.getAllQuizzSets);

// Get quiz by quiz id
quizRouter.get("/:id", verify.isLoggedIn, quizController.getQuizSetById);

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
  "/:quizId/attempts",
  verify.isLoggedIn,
  quizController.getQuizAttemptsByQuizId
);

// attempt quiz by quiz id
quizRouter.post(
  "/:quizId/attempt",
  [verify.isLoggedIn, validate(submitAttemptSchema)],
  quizController.attemptQuizSetById
);

// rate quiz by quiz id
quizRouter.post(
  "/:quizId/rate",
  verify.isLoggedIn,
  quizController.rateQuizSetById
);

// // get quiz leaderboard by quiz id
// quizRouter.get(
//   "/:quizId/leaderboard",
//   verify.isLoggedIn,
//   quizController.getQuizLeaderboardByQuizId
// );

export default quizRouter;
