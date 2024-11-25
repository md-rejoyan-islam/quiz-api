import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID").nonempty("ID is required"),
  quizId: z
    .string({
      message: "Quiz ID is required",
      required_error: "Quiz ID is required",
      invalid_type_error: "Quiz ID must be a string",
    })
    .uuid("Quiz ID must be a valid UUID"),
  question: z.string({
    message: "Question text is required",
    required_error: "Question text is required",
  }),
  options: z
    .array(
      z
        .string({
          required_error: "Option text is required",
          invalid_type_error: "Each option must be a string",
        })
        .min(1, "Option text cannot be empty")
    )
    .min(4, { message: "Options must contain at least four items" })
    .refine((val) => val.length > 0, { message: "Options are required" }),
  correctAnswer: z
    .string({
      message: "Correct answer is required",
      required_error: "Correct answer is required",
    })
    .min(1, "Correct answer is required"),
  mark: z
    .number()
    .int("Mark must be an integer")
    .positive("Mark must be a positive number")
    .default(5)
    .refine((val) => val > 0, "Mark is required and must be greater than zero"),
});
