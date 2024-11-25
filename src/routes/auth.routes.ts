import express from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate";
import verify from "../middlewares/verify";
import authValidator from "../validators/auth.validator";

const authRouter = express.Router();

/**
 * @route POST /register
 * @description Register a new user
 * @body { email: string, password: string, full_name: string }
 * @returns { status: string, data: user }
 * @error { status: string, message: string }
 */
authRouter.post(
  "/register",
  [validate(authValidator.registerSchema)],
  authController.register
);

/**
 * @route POST /login
 * @description Login a user
 * @body { email: string, password: string }
 * @returns { status: string, data: { user: object, tokens: object } }
 * @error { status: string, message: string }
 */
authRouter.post(
  "/login",
  [validate(authValidator.loginSchema)],
  authController.login
);

/**
 * @route POST /refresh-token
 * @description Refresh the JWT token using a refresh token
 * @body { refreshToken: string }
 * @returns { status: string, data: { accessToken: string, refreshToken: string } }
 * @error { status: string, message: string }
 */
authRouter.post(
  "/refresh-token",
  [validate(authValidator.refreshTokenSchema)],
  authController.refreshToken
);

/**
 * @route POST /logout
 * @description Logout a user
 * @returns { status: string, message: string }
 * @error { status: string, message: string }
 */

authRouter.post("/logout", verify.isLoggedIn, authController.logout);

/**
 * @route GET /me
 * @description Get the current user
 * @returns { status: string, data: user }
 * @error { status: string, message: string }
 */

authRouter.get("/me", verify.isLoggedIn, authController.getMe);

export default authRouter;
