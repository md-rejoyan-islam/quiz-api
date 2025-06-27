import { Router } from "express";
import seedController from "../controllers/seed.controller";

const seedRouter = Router();

seedRouter.post("/users", seedController.createBulkSeedUsers);
seedRouter.post("/quiz-sets", seedController.createBulkSeedQuizSets);
seedRouter.post("/questions", seedController.createBulkSeedQuestions);
seedRouter.post("/attemps", seedController.createBulkSeedAttempts);

export default seedRouter;
