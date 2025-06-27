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
 * @throws {ConfictError} If the email is already registered.
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  const user = await authService.register({ email, password, fullName });
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
 * @throws {UnthorizedError}  If email or password is invalid.
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

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
  const { refreshToken } = req.body;
  const accessToken = await authService.refreshToken(refreshToken);
  successResponse(res, {
    statusCode: 200,
    message: "Token refreshed successfully",
    payload: {
      data: {
        accessToken,
      },
    },
  });
});

/**
 * @method GET
 * @route /auth/logout
 * @description Logs out a user and invalidates the refresh token
 * @returns {Object} Success message
 */

const logout = asyncHandler(async (req: RequestWithUser, res: Response) => {
  await authService.logout(req.user?.id!);

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
