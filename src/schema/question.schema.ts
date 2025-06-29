import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID").nonempty("ID is required"),
  quizSetId: z
    .string({
      message: "Quiz ID is required",
      required_error: "Quiz ID is required",
      invalid_type_error: "Quiz ID must be a string",
    })
    .uuid("Quiz ID must be a valid UUID"),
  question: z
    .string({
      message: "Question text is required",
      required_error: "Question text is required",
    })
    .min(1, "Question text is required"),
  options: z
    .array(z.string(), {
      message: "Options must be an array of strings|number ",
    })
    .min(4, { message: "At least four tag is required" }),
  answerIndices: z
    .array(
      z.number().int({
        message: "Each answer index must be an integer",
      }),
      {
        message: "Answer indices must be an array of numbers",
        invalid_type_error: "Answer indices must be an array of numbers",
      }
    )
    .min(1, "Each answer index must be at least 1"),

  mark: z
    .number()
    .int("Mark must be an integer")
    .positive("Mark must be a positive number")
    .default(5)
    .refine((val) => val > 0, "Mark is required and must be greater than zero"),
  time: z
    .number({
      message: "Time must be a number",
      invalid_type_error: "Time must be a number",
    })
    .int()
    .min(1)
    .default(30), // in seconds

  explanation: z
    .string({
      message: "Explanation is required",
      required_error: "Explanation is required",
    })
    .optional(),
});
