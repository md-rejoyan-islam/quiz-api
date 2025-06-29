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
  body: z.object({
    refreshToken: z
      .string({
        message: "Refresh token is required",
        invalid_type_error: "Refresh token must be a string",
        required_error: "Refresh token is required",
      })
      .min(1, "Refresh token cannot be empty"),
  }),
});

// forget password schema
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required",
        invalid_type_error: "Email must be a string",
        required_error: "Email is required",
      })
      .email("Invalid email format"),
  }),
});

// reset password schema
const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string({
        message: "Password is required",
        invalid_type_error: "Password must be a string",
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters long"),
  }),
});

// change password schema
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        message: "Old password is required",
        invalid_type_error: "Old password must be a string",
        required_error: "Old password is required",
      })
      .min(8, "Old password must be at least 8 characters long"),
    newPassword: z
      .string({
        message: "New password is required",
        invalid_type_error: "New password must be a string",
        required_error: "New password is required",
      })
      .min(8, "New password must be at least 8 characters long"),
  }),
});

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
