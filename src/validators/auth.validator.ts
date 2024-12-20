import { z } from "zod";
import { UserSchema } from "../schema/user.schema";

/**
 * @schema Register Schema
 * @description This schema validates the registration input data
 */
const registerSchema = z.object({
  body: UserSchema.pick({
    email: true,
    password: true,
    fullName: true,
  }),
});

/**
 * @schema Login Schema
 * @description This schema validates the login input data
 */
const loginSchema = z.object({
  body: UserSchema.pick({
    email: true,
    password: true,
  }),
});

/**
 * @schema Refresh Token Schema
 * @description This schema validates the refresh token input data
 */
const refreshTokenSchema = z.object({
  body: UserSchema.pick({
    refreshToken: true,
    id: true,
  }),
});

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
