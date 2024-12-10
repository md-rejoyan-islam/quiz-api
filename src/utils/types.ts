import { Request } from "express";
import { z } from "zod";
import { UserSchema } from "../schema/user.schema";

export interface RequestWithUser extends Request {
  user?: z.infer<typeof UserSchema>;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  SUPPERADMIN = "superadmin",
}

export enum QuizStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}
export enum QuizLabel {
  EASY = "easy",
  HARD = "hard",
  MEDIUM = "medium",
}
