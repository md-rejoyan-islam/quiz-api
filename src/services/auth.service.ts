import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import secret from "../app/secret";
import prisma from "../config/prisma";
import { sendEmail } from "../mail/password-reset-mail";
import AppError from "../utils/app-errors";
import { generateTokens } from "../utils/jwt";

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
  if (!email || !password) {
    throw createError.BadRequest("Email and password are required");
  }
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

// forget password
const forgotPassword = async ({
  email,
  protocol,
  host,
}: {
  email: string;
  protocol: string;
  host: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw createError.NotFound("User not found");
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // Token valid for 10 minutes
  const passwordHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetExpires: resetTokenExpiry,
      passwordResetToken: passwordHash,
    },
  });

  // Send reset link via email
  const resetURL = `${protocol}://${host}/api/v1/auth/reset-password/${resetToken}`;

  console.log("Reset URL:", resetURL);

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password.\n\n
  Please make a PUT request to: ${resetURL}\n\n
  If you did not request this, please ignore this email.\n`;

  try {
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: message,
      resetLink: resetURL,
    });
  } catch (error) {
    throw createError.InternalServerError("Error sending email");
  }

  return {
    message: "Password reset link sent to your email",
  };
};

/**
 * @description Resets the user's password using a reset token.
 * @param {string} token - Reset token from the user's email.
 * @param {string} newPassword - New password to set.
 * @returns Object Success message
 */

const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: hashedToken },
    // where: { passwordResetToken: hashedToken, passwordResetExpires: { gte: new Date() } },
  });

  if (
    !user ||
    !user?.passwordResetExpires ||
    user.passwordResetExpires.getTime() < Date.now()
  ) {
    throw createError.Unauthorized("Invalid or expired reset token");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: bcrypt.hashSync(newPassword, 10),
      passwordResetExpires: null,
      passwordResetToken: null,
    },
  });

  return {
    message: "Password has been reset successfully",
  };
};

// change password
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError.NotFound("User not found");
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw createError.Unauthorized("Old password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return {
    message: "Password changed successfully",
  };
};

export default {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
