import jwt from "jsonwebtoken";
import secret from "../app/secret";

/**
 * Generates access and refresh tokens for the user.
 *
 * @param {UserSchema} user - The user object containing user data (id, email).
 * @returns  Object containing `accessToken` and `refreshToken`.
 */
export const generateTokens = (user: {
  id: string;
  email: string;
  role: string;
}) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret.jwt.accessTokenSecret as string,
    { expiresIn: secret.jwt.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    secret.jwt.refreshTokenSecret as string,
    { expiresIn: secret.jwt.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};
