import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import secret from "../app/secret";
import prisma from "../config/prisma";
import AppError from "../utils/app-errors";
import { generateTokens } from "../utils/jwt"; // JWT generation utility

/**
 * Registers a new user
 *
 * @param {registerSchema} userData - Data containing the user's email, password, and full name.
 * @returns  User object without password.
 * @throws {AppError} If the email is already registered.
 */
const register = async (userData: {
  email: string;
  password: string;
  fullName: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", StatusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Logs in a user and generates JWT tokens
 *
 * @param {Object} credentials - Contains email and password for authentication.
 * @returns  Object containing user data (without password) and tokens.
 * @throws {AppError} If email or password is invalid.
 */
const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const tokens = generateTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    tokens,
  };
};

/**
 * Refreshes access token using the refresh token
 *
 * @param {string} token - Refresh token for generating new access tokens.
 * @returns  New JWT tokens (accessToken and refreshToken).
 * @throws {AppError} If refresh token is invalid.
 */
const refreshToken = async ({
  refreshToken,
  id,
}: {
  refreshToken: string;
  id: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }

  // validate refresh token
  const decoded = await jwt.verify(
    refreshToken,
    secret.jwt.refreshTokenSecret as string
  );

  if (!decoded) {
    throw new AppError("Invalid refresh token", StatusCodes.UNAUTHORIZED);
  }

  const tokens = generateTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
};

/**
 * Logs out a user and invalidates the refresh token
 *
 * @param {string} refreshToken - Refresh token to be invalidated
 * @returns Object Success message
 * @throws {AppError} If refresh token is invalid
 *
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
