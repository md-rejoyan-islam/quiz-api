import { z } from "zod";

const UpdateUserSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        invalid_type_error: "Full name must be a string",
      })
      .optional(),
    bio: z
      .string({
        invalid_type_error: "Bio must be a string",
      })
      .optional(),
  }),
});

export default {
  UpdateUserSchema,
};
