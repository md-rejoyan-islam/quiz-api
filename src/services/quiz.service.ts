import { Attempt, PrismaClient, Question, Quiz } from "@prisma/client";
import { QuizStatus } from "../utils/types";

const prisma = new PrismaClient();

interface CreateQuizData {
  title: string;
  description: string;
  status: string;
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
  return await prisma.quiz.findFirst({
    where: { id: quizId },
    include: { questions: true },
  });
};

interface Answer {
  question_id: string;
  answer: string;
}

const submitQuizAttempt = async (
  userId: string,
  quizId: string,
  answers: Answer[]
): Promise<Attempt> => {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
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

  const correctAndScore = answers.reduce(
    (acc, answer) => {
      const question = correctAnswers.find((q) => q.id === answer.question_id);
      if (question?.correctAnswer === answer.answer) {
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
      wrong: answers.length - correctAndScore.correct,
      skipped: quiz.questions.length - answers.length,
      percentage,
      completed: true,
    },
  });
};
const getUserAttempts = async (userId: string): Promise<Attempt[]> => {
  return await prisma.attempt.findMany({
    where: { userId },
    include: { quiz: true },
  });
};
const getQuizAttemptsById = async (
  quizId: string,
  queryParams: LeaderboardQuery
): Promise<Attempt[]> => {
  const { page = 1, limit = 10 } = queryParams;
  return await prisma.attempt.findMany({
    where: { quizId },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: true },
  });
};

const getQuizLeaderboardById = async (
  quizId: string,
  queryParams: LeaderboardQuery
): Promise<Attempt[]> => {
  const { page = 1, limit = 10 } = queryParams;
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
