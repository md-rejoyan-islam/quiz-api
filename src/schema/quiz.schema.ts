import { z } from "zod";
import { AttemptSchema } from "./attempt.schema";
import { QuestionSchema } from "./question.schema";
import { UserSchema } from "./user.schema";

const quizStatusEnum = z.preprocess(
  (val) => (typeof val === "string" ? val.toUpperCase() : val),
  z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
    errorMap: () => ({
      message: "Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED.",
    }),
  })
);

const quizLabelEnum = z.preprocess(
  (val) => (typeof val === "string" ? val.toUpperCase() : val),
  z.enum(["EASY", "MEDIUM", "HARD"], {
    errorMap: () => ({
      message: "Invalid label. Must be EASY, MEDIUM, or HARD.",
    }),
  })
);

// Zod schema for Quiz
export const QuizSchema = z.object({
  id: z
    .string({ required_error: "QUIZ id is required" })
    .uuid({ message: "QUIZ id must be a valid UUID" }),
  title: z
    .string({ required_error: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters long" }),
  description: z
    .string({ required_error: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters long" }),
  tags: z.preprocess((val) => {
    // Check if the value is a string
    if (typeof val === "string") {
      try {
        // Attempt to parse the string as JSON
        return JSON.parse(val);
      } catch (error) {
        // If parsing fails, return the original value to fail validation
        return val;
      }
    }
    // If it's not a string (e.g., already an array), pass it through
    return val;
  }, z.array(z.string(), { message: "Tags must be an array of strings" }).min(1, { message: "At least one tag is required" })),

  status: quizStatusEnum.optional(),
  label: quizLabelEnum,
  userId: z.string({ required_error: "User ID is required" }),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: UserSchema, // Optional to avoid circular dependencies
  questions: QuestionSchema.array().optional(),
  attempts: AttemptSchema.array().optional(),
});

// Infer the TypeScript type from the schema
export type QuizType = z.infer<typeof QuizSchema>;
