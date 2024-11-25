import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  fullName: z
    .string({
      message: "Full name is required",
      invalid_type_error: "Full name must be a string",
      required_error: "Full name is required",
    })
    .min(1, "Full name is required"),
  email: z
    .string({
      message: "Email is required",
      invalid_type_error: "Email must be a string",
      required_error: "Email is required",
    })
    .email("Invalid email format"),
  password: z
    .string({
      message: "Password is required",
      invalid_type_error: "Password must be a string",
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters long"),
  role: z.string().default("USER"),
  refreshToken: z.string().optional(),
  quizzes: z.array(z.object({ id: z.string() })).optional(),
  attempts: z.array(z.object({ id: z.string() })).optional(),
});
