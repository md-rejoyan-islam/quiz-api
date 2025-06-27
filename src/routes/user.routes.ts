import { ROLE } from "@prisma/client";
import { Router } from "express";
import userController from "../controllers/user.controller";
import { authorize, authorizeOwnerOrAdmin } from "../middlewares/authorize";
import verify from "../middlewares/verify";

const userRouter = Router();

userRouter.use(verify.isLoggedIn);

// get all user
userRouter.get("/", authorize([ROLE.ADMIN]), userController.getAllUsers);

// get user by his own id
userRouter.get(
  "/:id",
  authorize([ROLE.ADMIN, ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserById
);

// update user by his own id
userRouter.put(
  "/:id",
  authorize([ROLE.ADMIN, ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.updateUser
);

// delete user
userRouter.delete(
  "/:id",
  authorize([ROLE.ADMIN, ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.deleteUser
);

// get all admin quizzes
userRouter.get(
  "/:id/quizzes",
  authorize([ROLE.ADMIN, ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserQuizzesById
);

// get all user attemps quizzes
userRouter.get(
  "/:id/attempts",
  authorize([ROLE.ADMIN, ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserAttemptsById
);

// get user ratings quizzes
userRouter.get(
  "/:id/ratings",
  authorize([ROLE.ADMIN, ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserRatingsById
);

// ban a user
userRouter.post(
  "/:id/ban",
  authorize([ROLE.ADMIN]),
  userController.banUserById
);

// unban a user
userRouter.post(
  "/:id/unban",
  authorize([ROLE.ADMIN]),
  userController.unbanUserById
);

export default userRouter;
