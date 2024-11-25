import { z } from "zod";
import { QuestionSchema } from "../schema/question.schema";
import { QuizSchema } from "../schema/quiz.schema";

/**
 * @schema List Quiz Schema
 * @description This schema validates the query parameters for listing quizzes
 */
export const listQuizSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(["published", "draft"]).optional(),
  search: z.string().optional(),
});

/**
 * @schema Create Quiz Schema
 * @description This schema validates the creation of a new quiz
 */
export const createQuizSchema = z.object({
  body: QuizSchema.pick({
    title: true,
    description: true,
  }),
});

/**
 * @schema Create Bulk Questions Schema
 * @description This schema validates the bulk creation of questions for a quiz
 */
export const createBulkQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1, { message: "Question is required" }),
        options: z
          .array(z.string())
          .min(2, { message: "At least 2 options are required" }),
        correctAnswer: z
          .string()
          .min(1, { message: "Correct answer is required" }),
        marks: z.number().default(5),
      })
    )
    .min(1, { message: "At least one question is required" }),
});

/**
 * @schema Update Quiz Schema
 * @description This schema validates the update of an existing quiz
 */
export const updateQuizSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

/**
 * @schema Create Question Schema
 * @description This schema validates the creation of a new question for a quiz
 */
export const createQuestionSchema = z.object({
  body: QuestionSchema.pick({
    question: true,
    options: true,
    correctAnswer: true,
    mark: true,
  }),
});

/**
 * @schema Submit Attempt Schema
 * @description This schema validates the submission of quiz answers
 */
export const submitAttemptSchema = z.object({
  answers: z
    .array(z.string())
    .min(1, { message: "At least one answer is required" }),
});
