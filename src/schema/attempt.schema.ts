import { z } from "zod";

export const AttemptSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  quizSetId: z.string().uuid("Quiz Set ID must be a valid UUID"),
  time: z
    .number(
      { required_error: "Time is required" } // Ensure time is provided
    )
    .int()
    .positive("Time must be a positive integer"),
  submittedAnswers: z
    .record(
      z.string().uuid("Object Key must be a valid question UUID"),
      z
        .array(
          z
            .number({
              required_error: "Answer must be a number",
              invalid_type_error: "Each answer must be a number",
            })
            .int("Answer must be an integer")
            .nonnegative("Answer must be a non-negative number"),
          {
            invalid_type_error: "Each answer must be an array of indices",
          }
        )
        .min(1, "Answers array cannot be empty"),
      {
        invalid_type_error:
          "Answers must be an object with question IDs as keys and arrays of answer indices as values22",
        required_error: "Sumitted answers are required",
      }
    )
    .refine((val) => {
      if (Object.keys(val).length === 0) {
        throw new Error("Minimum one object is required in answers");
      }
      return true;
    }),
  score: z.number().int().min(0).default(0),
  correct: z.number().int().min(0).default(0),
  wrong: z.number().int().min(0).default(0),
  skipped: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});
