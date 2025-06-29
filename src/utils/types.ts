import { Request } from "express";
import { z } from "zod";
import { UserSchema } from "../schema/user.schema";

export interface RequestWithUser extends Request {
  user?: Omit<z.infer<typeof UserSchema>, "password">;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
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

export interface PAGINATION {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface PAGINATION_QUERY {
  page?: number;
  limit?: number;
  skip?: number;
}
