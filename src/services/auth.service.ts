import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import secret from "../app/secret";
import prisma from "../config/prisma";
import AppError from "../utils/app-errors";
import { generateTokens } from "../utils/jwt"; // JWT generation utilityules/./index.d

/**
 * @description                      Registers a new user in the system.
 * @param {registerSchema} payload - Data containing the user's email, password, and full name.
 * @returns                          User object without password.
 * @throws {ConfictError}            If the email is already registered.
 */
const register = async (
  payload: Pick<User, "email" | "password" | "fullName">
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw createError.Conflict("Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * @method                    POST
 * @route                     /auth/login
 * @description               Logs in a user and generates JWT tokens.
 * @param {Object} payload -  Contains email and password for authentication.
 * @returns                   Object containing user data (without password) and tokens.
 * @throws {UnthorizedError}  If email or password is invalid.
 *
 */
const login = async (payload: Pick<User, "email" | "password">) => {
  const { email, password } = payload;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError.Unauthorized("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError.Unauthorized("Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  const { password: _, createdAt, updatedAt, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

/**
 * @method POST
 * @route /auth/refresh-token
 * @description Refreshes access token using the refresh token.
 * @param {string} refreshToken - Refresh token for generating new access tokens.
 * @returns  New JWT tokens (accessToken and refreshToken).
 */
const refreshToken = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    secret.jwt.refreshTokenSecret as string
  ) as JwtPayload as { id: string; email: string; role: User["role"] };

  if (!decoded) {
    throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }

  const { email, role, id } = decoded;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw createError.Unauthorized("User not found");
  }

  const { accessToken } = generateTokens({ id, email, role });

  return accessToken;
};

/**
 * @description User logout
 * @param {string} userId - Refresh token to be invalidated
 * @returns Object Success message
 */

const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

export default {
  register,
  login,
  refreshToken,
  logout,
};
