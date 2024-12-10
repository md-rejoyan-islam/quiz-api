import { Attempt, PrismaClient, Question, Quiz } from "@prisma/client";
import AppError from "../utils/app-errors";
import { QuizStatus } from "../utils/types";

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

const listQuizzes = async ({
  search,
}: {
  search?: string;
}): Promise<Quiz[]> => {
  return await prisma.quiz.findMany({
    where: {
      status: QuizStatus.PUBLISHED,
      ...(search && { title: { contains: search } }),
    },
    include: {
      questions: true,
    },
  });
};

const listQuizSetForAdmin = async (id: string): Promise<Quiz[]> => {
  return await prisma.quiz.findMany({
    where: {
      userId: id,
    },
    include: {
      questions: true,
    },
  });
};

const createQuiz = async (
  quizData: CreateQuizData,
  userId: string
): Promise<Quiz> => {
  return await prisma.quiz.create({
    data: {
      ...quizData,
      userId,
    },
  });
};

const updateQuiz = async (
  quizId: string,
  quizData: CreateQuizData
): Promise<Quiz> => {
  return await prisma.quiz.update({
    where: { id: quizId },
    data: quizData,
  });
};

const addQuestion = async (
  quizId: string,
  questionData: QuestionData
): Promise<Question> => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
  });

  if (!quiz) {
    throw AppError.notFound("Quiz not found with quizId:" + quizId);
  }

  return await prisma.question.create({
    data: {
      ...questionData,
      quizId,
      options: JSON.stringify(questionData.options),
    },
  });
};

const addBulkQuestions = async (
  quizId: string,
  questionsData: QuestionData[]
): Promise<Question[]> => {
  const createdQuestions: Question[] = [];
  for (const data of questionsData) {
    const createdQuestion = await prisma.question.create({
      data: {
        ...data,
        quizId,
        options: JSON.stringify(data.options),
      },
    });
    createdQuestions.push(createdQuestion);
  }
  return createdQuestions;
};

const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) throw AppError.notFound("Quiz not found with quizId:" + quizId);

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

interface Answer {
  [question_id: string]: string;
  answer: string;
}

const submitQuizAttempt = async (
  userId: string,
  quizId: string,
  answers: Answer
): Promise<Attempt> => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    throw AppError.notFound("Quiz not found with quizId:" + quizId);
  }

  // if already attempted
  const existingAttempt = await prisma.attempt.findFirst({
    where: { userId, quizId },
  });

  if (existingAttempt) {
    throw AppError.badRequest("Quiz already attempted");
  }

  const questionIds = quiz.questions.map((question) => question.id);
  const answerIds = Object.keys(answers);

  //  if invalid question id is present in answers
  const invalidQuestion = answerIds.find((id) => !questionIds.includes(id));

  if (invalidQuestion) {
    throw AppError.badRequest("Invalid question id:" + invalidQuestion);
  }

  const correctAnswers = quiz?.questions.map((question) => {
    return {
      id: question.id,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
    };
  });

  // answers = [{id: 1, answer: "A"}, {id: 2, answer: "B"}]
  // correctAnswers = [{id: 1, correctAnswer: "A"}, {id: 2, correctAnswer: "B"}]

  // Calculate correct answers and score
  const correctAndScore = Object.entries(answers).reduce(
    (acc, [question_id, answer]) => {
      const question = correctAnswers.find((q) => q.id === question_id);
      if (question?.correctAnswer === answer) {
        return {
          correct: acc.correct + 1,
          score: acc.score + question.marks,
        };
      }
      return acc;
    },
    {
      correct: 0,
      score: 0,
    }
  );

  const totalMarks = quiz.questions.reduce((acc, question) => {
    return acc + question.marks;
  }, 0);

  const percentage = (correctAndScore.score / totalMarks) * 100;

  return await prisma.attempt.create({
    data: {
      userId,
      quizId,
      submittedAnswers: JSON.stringify(answers),
      correct: correctAndScore.correct,
      score: correctAndScore.score,
      wrong: Object.keys(answers).length - correctAndScore.correct,
      skipped: quiz.questions.length - Object.keys(answers).length,
      percentage,
      completed: true,
    },
  });
};

interface QuizAttemptsResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: Attempt[];
}

const getUserAttempts = async (userId: string): Promise<Attempt[]> => {
  return await prisma.attempt.findMany({
    where: { userId },
    include: { quiz: true },
  });
};
const getQuizAttemptsById = async (
  quizId: string,
  queryParams: LeaderboardQuery
): Promise<QuizAttemptsResponse> => {
  const { page, limit } = queryParams;

  const attempts = await prisma.attempt.findMany({
    where: { quizId },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: true },
  });

  const pagination = {
    page,
    limit,
    totalPage: Math.ceil(
      (await prisma.attempt.count({ where: { quizId } })) / limit
    ),
    total: await prisma.attempt.count({ where: { quizId } }),
  };

  return {
    pagination,
    data: attempts,
  };
};

const getQuizLeaderboardById = async (
  quizId: string,
  queryParams: LeaderboardQuery
): Promise<Attempt[]> => {
  const { page = 1, limit = 10 } = queryParams;

  console.log(page, limit);

  return await prisma.attempt.findMany({
    where: { quizId },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: true },
    orderBy: { percentage: "desc" },
  });
};

const deleteQuestion = async (questionId: string): Promise<Question | null> => {
  return await prisma.question.delete({
    where: {
      id: questionId,
    },
  });
};

const editQuestion = async (
  questionId: string,
  questionData: QuestionData
): Promise<Question> => {
  return await prisma.question.update({
    where: { id: questionId },
    data: {
      ...questionData,
      options: JSON.stringify(questionData.options),
      updatedAt: new Date(),
    },
  });
};

const deleteQuizSet = async (quizId: string): Promise<Quiz | null> => {
  return await prisma.quiz.delete({
    where: { id: quizId },
  });
};

export default {
  listQuizzes,
  listQuizSetForAdmin,
  createQuiz,
  updateQuiz,
  addQuestion,
  addBulkQuestions,
  getQuiz,
  submitQuizAttempt,
  getUserAttempts,
  getQuizLeaderboardById,
  getQuizAttemptsById,
  deleteQuestion,
  editQuestion,
  deleteQuizSet,
};
