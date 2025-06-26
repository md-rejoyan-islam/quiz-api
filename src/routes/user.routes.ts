import { Router } from "express";
import userController from "../controllers/user.controller";
import { authorize, authorizeOwnerOrAdmin } from "../middlewares/authorize";
import verify from "../middlewares/verify";
import { USER_ROLE } from "../types";

const userRouter = Router();

userRouter.use(verify.isLoggedIn);

// get all user
userRouter.get("/", authorize([USER_ROLE.ADMIN]), userController.getAllUsers);

// get user by his own id
userRouter.get(
  "/:id",
  authorize([USER_ROLE.ADMIN, USER_ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserById
);

// update user by his own id
userRouter.put(
  "/:id",
  authorize([USER_ROLE.ADMIN, USER_ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.updateUser
);

// delete user
userRouter.delete(
  "/:id",
  authorize([USER_ROLE.ADMIN, USER_ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.deleteUser
);

// get all admin quizzes
userRouter.get(
  "/:id/quizzes",
  authorize([USER_ROLE.ADMIN, USER_ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserQuizzesById
);

// get all user attemps quizzes
userRouter.get(
  "/:id/attempts",
  authorize([USER_ROLE.ADMIN, USER_ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserAttemptsById
);

// get user ratings quizzes
userRouter.get(
  "/:id/ratings",
  authorize([USER_ROLE.ADMIN, USER_ROLE.USER]),
  authorizeOwnerOrAdmin,
  userController.getUserRatingsById
);

// ban a user
userRouter.post(
  "/:id/ban",
  authorize([USER_ROLE.ADMIN]),
  userController.banUserById
);

// unban a user
userRouter.post(
  "/:id/unban",
  authorize([USER_ROLE.ADMIN]),
  userController.unbanUserById
);

export default userRouter;
