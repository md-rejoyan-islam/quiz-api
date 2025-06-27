import { ROLE } from "@prisma/client";
import { Router } from "express";
import questionController from "../controllers/question.controller";
import { authorize } from "../middlewares/authorize";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import quizValidator from "../validators/quiz.validator";

const questionRouter = Router();

questionRouter.use(verify.isLoggedIn);

// get question by question id
questionRouter.get("/:id", questionController.getQuestionById);

// update question by question id when quiz set is draft
questionRouter.patch(
  "/:id",
  [authorize([ROLE.ADMIN]), validate(quizValidator.updateQuestionSchema)],
  questionController.updateQuestionById
);

// delete question by question id when quiz set is draft
questionRouter.delete(
  "/:id",
  authorize([ROLE.ADMIN]),
  questionController.deleteQuestionById
);

export default questionRouter;
