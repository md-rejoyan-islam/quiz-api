import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import secret from "../app/secret";

/**
 * @description Generates JWT tokens for user authentication.
 * @param {Object} payload - User data containing `id`, `email`, and `role`.
 * @returns {Object}  Object containing `accessToken` and `refreshToken`.
 */
export const generateTokens = (
  payload: Pick<User, "id" | "email" | "role">
): {
  accessToken: string;
  refreshToken: string;
} => {
  const { id, email, role } = payload;
  const accessToken = jwt.sign(
    { id, email, role },
    secret.jwt.accessTokenSecret as string,
    { expiresIn: secret.jwt.accessTokenExpiresIn }
  );

  const refreshToken = jwt.sign(
    { id },
    secret.jwt.refreshTokenSecret as string,
    { expiresIn: secret.jwt.refreshTokenExpiresIn }
  );

  return { accessToken, refreshToken };
};
