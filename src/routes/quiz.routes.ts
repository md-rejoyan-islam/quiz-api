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
  [
    verify.isLoggedIn,
    authorize([ROLE.ADMIN]),
    validate(quizValidator.createQuizSchema),
  ],
  quizController.createQuizSet
);

// get all quizzes which are published
quizRouter.get("/", quizController.getAllQuizzSets);

// Get quiz by quiz id
quizRouter.get("/:id", quizController.getQuizSetById);

// update quiz by quiz id
quizRouter.patch(
  "/:id",
  [
    verify.isLoggedIn,
    authorize([ROLE.ADMIN]),
    validate(quizValidator.updateQuizSchema),
  ],
  quizController.updateQuizSetById
);

// delete quiz by quiz id
quizRouter.delete("/:id", verify.isLoggedIn, quizController.deleteQuizSetById);

//publish quiz by quiz id
quizRouter.patch(
  "/:id/publish",
  [verify.isLoggedIn, authorize([ROLE.ADMIN])],
  quizController.publishedQuizSetById
);

// get quiz attempts by quiz id
quizRouter.get(
  "/:id/attempts",
  [verify.isLoggedIn, authorize([ROLE.ADMIN])],
  quizController.getQuizAttemptsByQuizId
);

// attempt quiz by quiz id
quizRouter.post(
  "/:id/attempt",
  [
    verify.isLoggedIn,
    authorize([ROLE.USER]),
    validate(quizValidator.createAttemptSchema),
  ],
  quizController.attemptQuizSetById
);

// get all questions by quiz id
quizRouter.get("/:id/questions", questionController.getQuestionsByQuizSetId);

// create a new question for a quiz
quizRouter.post(
  "/:id/questions",
  [
    verify.isLoggedIn,
    authorize([ROLE.ADMIN]),
    validate(quizValidator.createQuestionSchema),
  ],
  questionController.createQuestion
);

// bulk create questions for a quiz
quizRouter.post(
  "/:id/questions/bulk",
  [
    verify.isLoggedIn,
    authorize([ROLE.ADMIN]),
    validate(quizValidator.createBulkQuestionsSchema),
  ],
  questionController.createBulkQuestions
);

// rate quiz by quiz id
quizRouter.post("/:id/rate", verify.isLoggedIn, quizController.rateQuizSetById);

export default quizRouter;
