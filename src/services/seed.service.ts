import {
  Attempt,
  Question,
  QuizSet,
  ROLE,
  User,
  USER_STATUS,
} from "@prisma/client";
import prisma from "../config/prisma";

const createBulkSeedUsers = async (users: User[]) => {
  // validate
  users.forEach((user) => {
    if (!user.id) throw new Error("User ID is required");
    if (!user.email) throw new Error("User email is required");
    if (!user.fullName) throw new Error("User fullName is required");
    if (!user.role) throw new Error("User role is required");
    if (!user.status) throw new Error("User status is required");
  });

  // delete before all users
  await prisma.user.deleteMany();

  const usersCount = await prisma.user.createMany({
    data: users.map((user) => ({
      ...user,
      status: user.status.toUpperCase() as USER_STATUS,
      role: user.role.toUpperCase() as ROLE,
    })),
  });

  return usersCount;
};

const createBulkSeedQuizSets = async (quizSets: QuizSet[]) => {
  // check userId is valid if not throw error
  const userIds = quizSets.map((quizSet) => quizSet.userId);
  const validUsers = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: { id: true },
  });
  const validUserIds = validUsers.map((user) => user.id);
  quizSets.forEach((quizSet) => {
    if (!validUserIds.includes(quizSet.userId)) {
      throw new Error(`Invalid userId: ${quizSet.userId}`);
    }
  });

  // delete before all quiz sets
  await prisma.quizSet.deleteMany();

  const quizSetsCount = await prisma.quizSet.createMany({
    data: quizSets,
  });
  return quizSetsCount;
};

const createBulkSeedQuestions = async (questions: Question[]) => {
  // validate questions
  questions.forEach((question) => {
    if (!question.id) throw new Error("Question ID is required");
    if (!question.quizSetId) throw new Error("Question quizSetId is required");
    if (!question.question) throw new Error("Question text is required");
    if (!question.options || question.options.length === 0) {
      throw new Error(`Question options are required with id: ${question.id}`);
    }
    if (!question.answerIndices || question.answerIndices.length === 0) {
      throw new Error("Question answerIndices are required");
    }
    if (typeof question.mark !== "number" || question.mark <= 0) {
      throw new Error("Question mark must be a positive number");
    }
    if (typeof question.time !== "number" || question.time <= 0) {
      throw new Error("Question time must be a positive number");
    }
    if (question.explanation && typeof question.explanation !== "string") {
      throw new Error("Question explanation must be a string");
    }
  });

  const quizSetIds = questions.map((question) => question.quizSetId);
  const validQuizSets = await prisma.quizSet.findMany({
    where: {
      id: { in: quizSetIds },
    },
    select: { id: true },
  });
  const validQuizSetIds = validQuizSets.map((quizSet) => quizSet.id);
  questions.forEach((question) => {
    if (!validQuizSetIds.includes(question.quizSetId)) {
      throw new Error(`Invalid quizSetId: ${question.quizSetId}`);
    }
  });

  // delete before all questions
  await prisma.question.deleteMany();

  const createdQuestions = await prisma.question.createMany({
    data: questions,
  });

  return createdQuestions;
};

const createBulkSeedAttempts = async (attempts: Attempt[]) => {
  // validate attempts
  attempts.forEach((attempt) => {
    if (!attempt.id) throw new Error("Attempt ID is required");
    if (!attempt.quizSetId) throw new Error("Attempt quizSetId is required");
    if (!attempt.userId) throw new Error("Attempt userId is required");
    if (typeof attempt.score !== "number") {
      throw new Error("Attempt score must be a number");
    }
    if (!attempt.submittedAnswers) {
      throw new Error("Attempt submittedAnswers are required");
    }
    if (!attempt.time) {
      throw new Error("Attempt timeTaken is required");
    }

    if (typeof attempt.time !== "number") {
      throw new Error("Attempt timeTaken must be a number");
    }
  });

  const quizSetIds = attempts.map((attempt) => attempt.quizSetId);
  const validQuizSets = await prisma.quizSet.findMany({
    where: {
      id: { in: quizSetIds },
    },
    select: { id: true },
  });
  const validQuizSetIds = validQuizSets.map((quizSet) => quizSet.id);
  attempts.forEach((attempt) => {
    if (!validQuizSetIds.includes(attempt.quizSetId)) {
      throw new Error(`Invalid quizSetId: ${attempt.quizSetId}`);
    }
  });

  const userIds = attempts.map((attempt) => attempt.userId);
  const validUsers = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: { id: true },
  });
  const validUserIds = validUsers.map((user) => user.id);
  attempts.forEach((attempt) => {
    if (!validUserIds.includes(attempt.userId)) {
      throw new Error(`Invalid userId: ${attempt.userId}`);
    }
  });

  // delete before all attempts
  await prisma.attempt.deleteMany();

  const createdAttempts = await prisma.attempt.createMany({
    data: attempts,
  });

  return createdAttempts;
};

export default {
  createBulkSeedUsers,
  createBulkSeedQuizSets,
  createBulkSeedQuestions,
  createBulkSeedAttempts,
};
