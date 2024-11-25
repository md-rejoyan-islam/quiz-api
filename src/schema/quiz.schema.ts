import { z } from "zod";
import { QuizStatus } from "../utils/types";
import { AttemptSchema } from "./attempt.schema";
import { QuestionSchema } from "./question.schema";
import { UserSchema } from "./user.schema";

// Zod schema for Quiz
export const QuizSchema = z.object({
  id: z
    .string({ required_error: "QUIZ id is required" })
    .uuid({ message: "QUIZ id must be a valid UUID" }),
  title: z
    .string({ required_error: "Title is required" })
    .min(1, { message: "Title cannot be empty" }),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, { message: "Description cannot be empty" }),
  status: z.nativeEnum(QuizStatus),
  userId: z
    .string({ required_error: "User ID is required" })
    .min(1, { message: "User ID cannot be empty" }),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: UserSchema, // Optional to avoid circular dependencies
  questions: QuestionSchema.array().optional(),
  attempts: AttemptSchema.array().optional(),
});

// Infer the TypeScript type from the schema
export type QuizType = z.infer<typeof QuizSchema>;
