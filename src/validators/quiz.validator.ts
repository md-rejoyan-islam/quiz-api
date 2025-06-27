import { z } from "zod";
import { QuestionSchema } from "../schema/question.schema";
import { QuizSchema } from "../schema/quiz.schema";
import { QuizStatus } from "../utils/types";

/**
 * @schema List Quiz Schema
 * @description This schema validates the query parameters for listing quizzes
 */
const listQuizSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.enum(["published", "draft"]).optional(),
  search: z.string().optional(),
});

/**
 * @schema Create Quiz Schema
 * @description This schema validates the creation of a new quiz
 */
const createQuizSchema = z.object({
  body: QuizSchema.pick({
    title: true,
    description: true,
    status: true,
    label: true,
    tags: true,
  }),
});

/**
 * @schema Create Bulk Questions Schema
 * @description This schema validates the bulk creation of questions for a quiz
 */
const createBulkQuestionsSchema = z.object({
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
const updateQuizSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum([QuizStatus.DRAFT, QuizStatus.PUBLISHED]).optional(),
  }),
});

/**
 * @schema Create Question Schema
 * @description This schema validates the creation of a new question for a quiz
 */
const createQuestionSchema = z
  .object({
    body: QuestionSchema.pick({
      question: true,
      options: true,
      answerIndices: true,
      mark: true,
      time: true,
      explanation: true,
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.body.answerIndices.some(
        (index) => index < 0 || index >= data.body.options.length
      )
    ) {
      ctx.addIssue({
        path: ["body", "answerIndices"],
        code: z.ZodIssueCode.custom,
        message: "Answer indices must be within the range of options",
      });
    }
  });

// update question schema
const updateQuestionSchema = QuestionSchema.partial()
  .extend({
    body: z.object({
      options: z
        .array(z.string())
        .min(4, { message: "At least 4 options are required" })
        .optional(),
      answerIndices: z
        .array(
          z
            .number({ message: "Answer indices are required" })
            .int({ message: "Answer indices must be integers" })
        )
        .min(1, { message: "At least one answer index is required" })
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.body.answerIndices &&
      data.body.options &&
      data.body.answerIndices.some(
        (index) => index < 0 || index >= (data.body.options || []).length
      )
    ) {
      ctx.addIssue({
        path: ["body", "answerIndices"],
        code: z.ZodIssueCode.custom,
        message: "Answer indices must be within the range of options",
      });
    }
  });

/**
 * @schema Submit Attempt Schema
 * @description This schema validates the submission of quiz answers
 */
const submitAttemptSchema = z.object({
  body: z.object({ answers: z.array(z.record(z.string(), z.string())) }), // {answers: [{[questionId]: answer}]}
});

export default {
  createQuizSchema,
  submitAttemptSchema,
  createQuestionSchema,
  updateQuestionSchema,
};
