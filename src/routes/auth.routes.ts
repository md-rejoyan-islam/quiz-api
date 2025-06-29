import { Router } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import authValidator from "../validators/auth.validator";

const authRouter = Router();

// register routes
authRouter.post(
  "/register",
  [validate(authValidator.registerSchema)],
  authController.register
);

// login routes
authRouter.post(
  "/login",
  [validate(authValidator.loginSchema)],
  authController.login
);

// refresh token routes
authRouter.post(
  "/refresh-token",
  [validate(authValidator.refreshTokenSchema)],
  authController.refreshToken
);

// logout routes
authRouter.post("/logout", verify.isLoggedIn, authController.logout);

// get current user route
authRouter.get("/me", verify.isLoggedIn, authController.getMe);

// forget password routes
authRouter.post(
  "/forgot-password",
  [validate(authValidator.forgotPasswordSchema)],
  authController.forgotPassword
);

// reset password routes
authRouter.patch(
  "/reset-password/:token",
  [validate(authValidator.resetPasswordSchema)],
  authController.resetPassword
);

// password change route
authRouter.patch(
  "/change-password",
  verify.isLoggedIn,
  validate(authValidator.changePasswordSchema),
  authController.changePassword
);

export default authRouter;
