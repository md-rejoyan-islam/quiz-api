import { z } from "zod";
export const AttemptSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  quizId: z.string().uuid(),
  score: z.number().int().default(0),
  submittedAnswers: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, "Submitted answers should be a valid JSON string"),
  completed: z.boolean().default(true),
});
