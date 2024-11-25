import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import authService from "../services/auth.service";
import { successResponse } from "../utils/response-handler";
import { RequestWithUser } from "../utils/types";

/**
 * @method             POST
 * @route              /auth/register
 * @description        Registers a new user
 * @body               { email: string, password: string, fullName: string, role?: string }
 * @returns {Object}   user object without password
 * @throws {AppError}  If email already exists
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  successResponse(res, {
    statusCode: 201,
    message: "User registered successfully",
    payload: {
      data: user,
    },
  });
});

/**
 * @method             POST
 * @route              POST /auth/login
 * @description        Logs in a user and generates JWT tokens
 * @body               { email: string, password: string }
 * @returns {Object}   Object containing user data (without password) and tokens
 * @throws {AppError}  If email or password is invalid
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  successResponse(res, {
    statusCode: 200,
    message: "Login successful",
    payload: {
      data: result,
    },
  });
});

/**
 * @method              POST
 * @route               POST /auth/refresh-token
 * @description         Refreshes access token using the refresh token
 * @body                { refreshToken: string }
 * @returns {Object}    New JWT tokens (accessToken and refreshToken)
 * @throws {AppError}   If refresh token is invalid
 */
const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refreshToken(req.body);
  successResponse(res, {
    statusCode: 200,
    message: "Token refreshed successfully",
    payload: {
      data: tokens,
    },
  });
});

/**
 * @method GET
 * @route /auth/logout
 * @description Logs out a user and invalidates the refresh token
 * @returns {Object} Success message
 * @throws {AppError} If refresh token is invalid
 */

const logout = asyncHandler(async (req: RequestWithUser, res: Response) => {
  console.log(req.user);

  await authService.logout(req.user?.id as string);

  successResponse(res, {
    statusCode: 200,
    message: "Logout successful",
  });
});

/**
 * @method GET
 * @route /auth/me
 * @description Fetches the user details
 * @returns {Object} User details
 * @throws {AppError} If user is not found
 * @access Private
 * @param {RequestWithUser} req - Request object containing user data
 * @param {Response} res - Response object to send the response
 * @returns {JSON} User details
 *
 */
const getMe = asyncHandler(async (req: RequestWithUser, res: Response) => {
  successResponse(res, {
    statusCode: 200,
    message: "User details fetched successfully",
    payload: {
      data: req.user,
    },
  });
});

export default {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
