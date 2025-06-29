import { z } from "zod";
import { AttemptSchema } from "../schema/attempt.schema";
import { QuestionSchema } from "../schema/question.schema";
import { QuizSchema } from "../schema/quiz.schema";

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
 * @schema Update Quiz Schema
 * @description This schema validates the update of an existing quiz
 */
const updateQuizSchema = z.object({
  body: QuizSchema.partial(),
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

/**
 * @schema Create Bulk Questions Schema
 * @description This schema validates the bulk creation of questions for a quiz
 */
const createBulkQuestionsSchema = z.object({
  body: z
    .array(
      QuestionSchema.pick({
        question: true,
        options: true,
        answerIndices: true,
        mark: true,
        time: true,
        explanation: true,
      }),
      {
        required_error: "At least one question is required",
        invalid_type_error: "Questions must be an array",
      }
    )
    .min(1, "At least one question is required"),
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

export const createAttemptSchema = z.object({
  body: AttemptSchema.omit({
    id: true,
    score: true,
    correct: true,
    wrong: true,
    skipped: true,
    createdAt: true,
    updatedAt: true,
    quizSetId: true,
    userId: true,
  }),
});

export default {
  createQuizSchema,
  createAttemptSchema,
  createQuestionSchema,
  updateQuestionSchema,
  updateQuizSchema,
  createBulkQuestionsSchema,
};
