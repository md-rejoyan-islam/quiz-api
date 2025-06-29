import { PrismaClient, QUIZ_LABEL, QUIZ_STATUS, QuizSet } from "@prisma/client";
import createError from "http-errors";

const prisma = new PrismaClient();

// create quiz
const createQuizSet = async (
  payload: Pick<QuizSet, "title" | "description" | "status" | "label" | "tags">,
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

  const quiz = await prisma.quizSet.create({
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
  return {
    ...quiz,
    tags: JSON.parse(quiz.tags),
    questions: [],
  };
};

// get all quizzes
const getAllQuizSet = async ({
  page,
  skip,
  limit,
}: {
  page: number;
  skip: number;
  limit: number;
}) => {
  const [quizSets, total] = await prisma.$transaction([
    prisma.quizSet.findMany({
      include: { questions: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.quizSet.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      page,
      limit,
      totalPages,
      totalItems: total,
    },
    quizSets: quizSets.map((quizSet) => {
      return {
        ...quizSet,
        tags: JSON.parse(quizSet.tags),
        questions:
          quizSet?.questions?.map((question) => {
            return {
              ...question,
              options: JSON.parse(question.options),
              answerIndices: JSON.parse(question.answerIndices),
            };
          }) || [],
        links: {
          self: {
            href: `/api/v1/quiz-sets/${quizSet.id}`,
            method: "GET",
          },
          questions: {
            href: `/api/v1/quiz-sets/${quizSet.id}/questions`,
            method: "GET",
          },
          attempts: {
            href: `/api/v1/quiz-sets/${quizSet.id}/attempts`,
            method: "GET",
          },
          rate: {
            href: `/api/v1/quiz-sets/${quizSet.id}/rate`,
            method: "POST",
          },
          publish: {
            href: `/api/v1/quiz-sets/${quizSet.id}/publish`,
            method: "PUT",
          },
          attempt: {
            href: `/api/v1/quiz-sets/${quizSet.id}/attempt`,
            method: "POST",
          },
        },
      };
    }),
    links: {
      self: {
        href: `/api/v1/quiz-sets?page=${page}&limit=${limit}`,
        method: "GET",
      },
      create: {
        href: `/api/v1/quiz-sets`,
        method: "POST",
      },
    },
  };
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
  quizData: Pick<QuizSet, "title" | "description" | "status" | "label" | "tags">
) => {
  const existQuiz = await prisma.quizSet.findUnique({
    where: { id: quizId },
  });
  if (!existQuiz) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }

  if (quizData?.tags) {
    quizData.tags = JSON.stringify(quizData.tags);
  }
  if (quizData?.status) {
    quizData.status =
      QUIZ_STATUS[quizData.status.toUpperCase() as keyof typeof QUIZ_STATUS];
  }
  if (quizData?.label) {
    quizData.label =
      QUIZ_LABEL[quizData.label.toUpperCase() as keyof typeof QUIZ_LABEL];
  }

  const quizSet = await prisma.quizSet.update({
    where: { id: quizId },
    data: quizData,
  });

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
  const existQuiz = await prisma.quizSet.findUnique({
    where: { id: quizId },
  });
  if (!existQuiz) {
    throw createError.NotFound("Quiz not found with quizId:" + quizId);
  }

  const quiz = await prisma.quizSet.update({
    where: { id: quizId },
    data: {
      status: QUIZ_STATUS.PUBLISHED,
    },
  });

  console.log(quiz);

  return quiz;
};

// attempt quiz set by Id
const attemptQuizSetById = async (
  userId: string,
  quizId: string,
  time: number,
  submittedAnswers: { [questionId: string]: number[] }
) => {
  const quiz = await prisma.quizSet.findUnique({
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
  const invalidQuestions = Object.keys(submittedAnswers).filter(
    (id) => !quiz.questions.some((q) => q.id === id)
  );
  if (invalidQuestions.length) {
    throw createError.BadRequest(
      "Invalid question ids: " + invalidQuestions.join(", ")
    );
  }

  // calculate marks array
  const markResults = Object.entries(submittedAnswers).map(
    ([questionId, answer]) => {
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
    }
  );

  const totalQuestions = quiz.questions.length;
  const correct = markResults.filter((mark) => mark > 0).length;
  const score = markResults.reduce((acc, mark) => acc + mark, 0);
  const wrong = totalQuestions - correct;
  const skipped = totalQuestions - markResults.length;

  const attempt = await prisma.attempt.create({
    data: {
      userId,
      correct,
      score,
      wrong,
      skipped,
      time,
      quizSetId: quizId,
      submittedAnswers: JSON.stringify(submittedAnswers),
    },
  });

  return {
    ...attempt,
    submittedAnswers: JSON.parse(attempt.submittedAnswers),
  };
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
  const quiz = await prisma.quizSet.findUnique({
    where: { id: quizId },
  });
  if (!quiz) {
    throw createError.NotFound("Quiz not found with quizId: " + quizId);
  }

  const attempts = await prisma.attempt.findMany({
    where: { quizSetId: quizId },
    include: { user: true },
  });
  if (!attempts || attempts.length === 0) {
    throw createError.NotFound("No attempts found for quiz with ID: " + quizId);
  }
  return attempts.map((attempt) => ({
    ...attempt,
    submittedAnswers: JSON.parse(attempt.submittedAnswers),
    user: {
      id: attempt.user.id,
      fullName: attempt.user.fullName,
      email: attempt.user.email,
    },
  }));
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
