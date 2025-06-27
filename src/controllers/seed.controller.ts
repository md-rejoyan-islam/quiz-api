import asyncHandler from "express-async-handler";

// create bulk users

import { Request, Response } from "express";
import { successResponse } from "../utils/response-handler";

import {
  Attempt,
  Question,
  QUIZ_LABEL,
  QUIZ_STATUS,
  QuizSet,
  User,
} from "@prisma/client";
import attempts from "../../data/attemps.json";
import questions from "../../data/questions.json";
import quizSets from "../../data/quiz.json";
import users from "../../data/user.json";
import seedService from "../services/seed.service";

/*
 * @method POST
 * @route  /seed/users
 * @description Create bulk seed users
 * @returns { status: string, data: Array<User> }
 * @error { status: string, message: string }
 */

const createBulkSeedUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const count = await seedService.createBulkSeedUsers(users as User[]);

    successResponse(res, {
      statusCode: 201,
      message: "Bulk users created successfully",
      payload: {
        data: count,
      },
    });
  }
);

/* * @method POST
 * @route  /seed/quiz-sets
 * @description Create bulk seed quiz sets
 * @returns { status: string, data: Array<QuizSet> }
 * @error { status: string, message: string }
 * */
const createBulkSeedQuizSets = asyncHandler(
  async (_req: Request, res: Response) => {
    const data: QuizSet[] = quizSets.map((quizSet) => ({
      ...quizSet,
      status: quizSet.status as QUIZ_STATUS,
      label: quizSet.label as QUIZ_LABEL,
      tags: JSON.stringify(quizSet.tags),
      createdAt: new Date(quizSet.createdAt),
      updatedAt: new Date(quizSet.updatedAt),
    }));

    const count = await seedService.createBulkSeedQuizSets(data as QuizSet[]);
    successResponse(res, {
      statusCode: 201,
      message: "Bulk quiz sets created successfully",
      payload: {
        data: count,
      },
    });
  }
);

// bulk create questions for quiz sets

/*
 * @method POST
 * @route  /seed/questions
 * @description Create bulk seed questions for quiz sets
 * @returns { status: string, data: Array<Question> }
 * @error { status: string, message: string }
 *
 * */
const createBulkSeedQuestions = asyncHandler(
  async (_req: Request, res: Response) => {
    const data: Question[] = questions.map((question) => ({
      ...question,
      options: JSON.stringify(question.options),
      answerIndices: JSON.stringify(question.answerIndices),
      createdAt: new Date(question.createdAt),
      updatedAt: new Date(question.updatedAt),
    }));

    const count = await seedService.createBulkSeedQuestions(data);
    successResponse(res, {
      statusCode: 201,
      message: "Bulk questions created successfully",
      payload: {
        data: count,
      },
    });
  }
);

// bulk attempts for quiz sets

/**
 * @method POST
 * @route  /seed/attempts
 * @description Create bulk seed attempts for quiz sets
 * @returns { status: string, data: number }
 * @error { status: string, message: string }
 */

const createBulkSeedAttempts = asyncHandler(
  async (_req: Request, res: Response) => {
    const data: Attempt[] = attempts.map((attempt) => ({
      ...attempt,
      submittedAnswers: JSON.stringify(attempt.submittedAnswers),
      createdAt: new Date(attempt.createdAt),
      updatedAt: new Date(attempt.updatedAt),
    }));
    const count = await seedService.createBulkSeedAttempts(data);
    successResponse(res, {
      statusCode: 201,
      message: "Bulk attempts created successfully",
      payload: {
        data: count,
      },
    });
  }
);

export default {
  createBulkSeedUsers,
  createBulkSeedQuizSets,
  createBulkSeedQuestions,
  createBulkSeedAttempts,
};
