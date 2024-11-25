import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/prisma";
import AppError from "../utils/app-errors";
import { RequestWithUser, UserRole } from "../utils/types";

const verifyQuizOwnership = async (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const quizId = req.params.quizId || req.params.id;
  const userId = req.user?.id;

  // Skip ownership check if user is super admin (if you have such a role)
  if (req.user?.role === UserRole.SUPPERADMIN) {
    return next();
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    throw new AppError("Quiz not found", StatusCodes.NOT_FOUND);
  }

  if (quiz.userId !== userId) {
    throw new AppError(
      "You do not have permission to modify this quiz",
      StatusCodes.FORBIDDEN
    );
  }

  next();
};

export default verifyQuizOwnership;
