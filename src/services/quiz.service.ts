import { PrismaClient, QUIZ_LABEL, QUIZ_STATUS } from "@prisma/client";
import createError from "http-errors";
import { QUIZ_SET } from "../types";

const prisma = new PrismaClient();

interface CreateQuizData {
  title: string;
  description: string;
  status: string;
  label: string;
}

interface QuestionData {
  question: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface AttemptData {
  userId: number;
  quizId: number;
  answers: string[];
}

interface LeaderboardQuery {
  page: number;
  limit: number;
}

// create quiz
const createQuizSet = async (
  payload: Pick<
    QUIZ_SET,
    "title" | "description" | "status" | "label" | "tags"
  >,
  userId: string
) => {
  const existUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existUser) {
    throw createError.NotFound("User not found with userId:" + userId);
  }
  if (existUser.role !== "ADMIN") {
    throw createError.Forbidden("You are not authorized to create a quiz.");
  }

  if (existUser.status !== "ACTIVE") {
    throw createError.Forbidden("User is not active.Please contact support.");
  }

  return await prisma.quizSet.create({
    data: {
      ...payload,
      userId,
      tags: JSON.stringify(payload.tags),
      status:
        QUIZ_STATUS[
          payload.status?.toUpperCase() as keyof typeof QUIZ_STATUS
        ] || "DRAFT",
      label: QUIZ_LABEL[payload.label.toUpperCase() as keyof typeof QUIZ_LABEL],
    },
  });
};

// get all quizzes
const getAllQuizSet = async () => {
  const quizSets = await prisma.quizSet.findMany();
  if (!quizSets || quizSets.length === 0) {
    throw createError.NotFound("No quiz sets found");
  }
  return quizSets.map((quizSet) => {
    return {
      ...quizSet,
      tags: JSON.parse(quizSet.tags),
    };
  });
};

// get quiz by ID
const getQuizSetById = async (quizId: string) => {
  const quiz = await prisma.quizSet.findFirst({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }

  if (quiz?.questions) {
    quiz.questions = quiz.questions.map((question) => {
      return {
        ...question,
        options: JSON.parse(question.options),
      };
    });
  }

  return quiz;
};

// update quiz set by Id
const updateQuizSetById = async (
  quizId: string,
  quizData: Pick<
    QUIZ_SET,
    "title" | "description" | "status" | "label" | "tags"
  >
) => {
  const quizSet = await prisma.quizSet.update({
    where: { id: quizId },
    data: {
      ...quizData,
      tags: JSON.stringify(quizData.tags),
      status:
        QUIZ_STATUS[quizData.status.toUpperCase() as keyof typeof QUIZ_STATUS],
      label:
        QUIZ_LABEL[quizData.label.toUpperCase() as keyof typeof QUIZ_LABEL],
    },
  });
  if (!quizSet) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }
  return {
    ...quizSet,
    tags: JSON.parse(quizSet.tags),
  };
};

// delete quiz set by Id
const deleteQuizSetById = async (quizId: string) => {
  const existQuiz = await prisma.quizSet.findUnique({
    where: { id: quizId },
  });
  if (!existQuiz) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }

  await prisma.quizSet.delete({
    where: { id: quizId },
  });

  return existQuiz;
};

// publish quiz set by Id
const publishQuizSetById = async (quizId: string) => {
  const quiz = await prisma.quizSet.update({
    where: { id: quizId },
    data: {
      status: QUIZ_STATUS.PUBLISHED,
    },
  });
  if (!quiz) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }
  return quiz;
};

// attempt quiz set by Id
const attemptQuizSetById = async (
  userId: string,
  quizId: string,
  answers: { [questionId: string]: number[] }
) => {
  const quiz = await prisma.quizSet.findFirst({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }

  // if already attempted
  const existingAttempt = await prisma.attempt.findFirst({
    where: { userId, quizSetId: quizId },
  });

  if (existingAttempt) {
    throw createError.BadRequest("Quiz already attempted");
  }

  // throw error for invalid questions
  const invalidQuestions = Object.keys(answers).filter(
    (id) => !quiz.questions.some((q) => q.id === id)
  );
  if (invalidQuestions.length) {
    throw createError.BadRequest(
      "Invalid question ids: " + invalidQuestions.join(", ")
    );
  }

  // calculate marks array
  const markResults = Object.entries(answers).map(([questionId, answer]) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) {
      throw createError.BadRequest("Invalid question id: " + questionId);
    }
    const correctAnswer = JSON.parse(question.answerIndices) as number[];
    let isCorrect = false;
    if (correctAnswer.length !== answer.length) {
      isCorrect = false;
    } else {
      isCorrect = correctAnswer.every((index) => answer.includes(index));
    }

    return isCorrect ? question.mark : 0;
  });

  const totalQuestions = quiz.questions.length;
  const correct = markResults.filter((mark) => mark > 0).length;
  const score = markResults.reduce((acc, mark) => acc + mark, 0);
  const wrong = totalQuestions - correct;
  const skipped = totalQuestions - markResults.length;

  return await prisma.attempt.create({
    data: {
      userId,
      correct,
      score,
      wrong,
      skipped,
      quizSetId: quizId,
      submittedAnswers: JSON.stringify(answers),
    },
  });
};

// rate quiz set by Id
const rateQuizSetById = async (
  quizId: string,
  userId: string,
  rating: number
) => {
  const quizRating = await prisma.quizSetRating.upsert({
    where: {
      userId_quizSetId: {
        userId,
        quizSetId: quizId,
      },
    },
    update: { rating },
    create: {
      quizSetId: quizId,
      userId,
      rating,
    },
  });
  return quizRating;
};

// getQuizAttemptsByQuizId
const getQuizAttemptsByQuizId = async (quizId: string) => {
  const attempts = await prisma.attempt.findMany({
    where: { quizSetId: quizId },
    include: { user: true },
  });
  if (!attempts || attempts.length === 0) {
    throw createError.NotFound("No attempts found for quiz with ID: " + quizId);
  }
  return attempts;
};

export default {
  getAllQuizSet,
  publishQuizSetById,
  createQuizSet,
  updateQuizSetById,
  getQuizSetById,
  deleteQuizSetById,
  attemptQuizSetById,
  rateQuizSetById,
  getQuizAttemptsByQuizId,
};
