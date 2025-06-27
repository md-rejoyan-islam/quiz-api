import { Question } from "@prisma/client";
import createError from "http-errors";
import prisma from "../config/prisma";

// get questions by quiz set ID
const getQuestionsByQuizSetId = async (quizSetId: string) => {
  const questions = await prisma.question.findMany({
    where: {
      quizSetId,
    },
  });
  if (!questions || questions.length === 0) {
    throw createError.NotFound(
      "No questions found for the quiz set with ID: " + quizSetId
    );
  }
  return questions;
};

// create a new question for a quiz set
const createQuestion = async (
  quizSetId: string,
  payload: Pick<
    Question,
    "question" | "options" | "explanation" | "answerIndices" | "mark" | "time"
  >
) => {
  // Check if quizSetId is valid
  const quizSet = await prisma.quizSet.findUnique({
    where: {
      id: quizSetId,
    },
  });

  if (!quizSet) {
    throw createError.NotFound("Quiz set not found with ID: " + quizSetId);
  }

  const createdQuestion = await prisma.question.create({
    data: {
      ...payload,
      quizSetId,
      options: JSON.stringify(payload.options),
      answerIndices: JSON.stringify(payload.answerIndices),
    },
  });
  return {
    ...createdQuestion,
    options: JSON.parse(createdQuestion.options),
    answerIndices: JSON.parse(createdQuestion.answerIndices),
  };
};

// create bulk questions for a quiz set
const createBulkQuestions = async (
  quizSetId: string,
  questions: Pick<
    Question,
    "question" | "options" | "explanation" | "answerIndices" | "mark" | "time"
  >[]
) => {
  const createdQuestions = await prisma.question.createMany({
    data: questions.map((question) => ({
      ...question,
      quizSetId,
      options: JSON.stringify(question.options),
      answerIndices: JSON.stringify(question.answerIndices),
    })),
  });
  if (createdQuestions.count === 0) {
    throw createError.InternalServerError(
      "Failed to create questions for quiz set with ID: " + quizSetId
    );
  }
  return createdQuestions;
};

// get question by ID
const getQuestionById = async (questionId: string) => {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw createError.NotFound("Question not found with ID: " + questionId);
  }
  return question;
};

// update question by ID
const updateQuestionById = async (
  questionId: string,
  payload: Pick<
    Question,
    "question" | "options" | "explanation" | "answerIndices" | "mark" | "time"
  >
) => {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw createError.NotFound("Question not found with ID: " + questionId);
  }

  // convert options and answerIndices to JSON strings if they are arrays
  if (payload?.options) payload.options = JSON.stringify(payload.options);
  if (payload?.answerIndices)
    payload.answerIndices = JSON.stringify(payload.answerIndices);

  const updatedQuestion = await prisma.question.update({
    where: {
      id: questionId,
    },
    data: {
      ...payload,
    },
  });

  return {
    ...updatedQuestion,
    options: JSON.parse(updatedQuestion.options),
    answerIndices: JSON.parse(updatedQuestion.answerIndices),
  };
};

// delete question by ID
const deleteQuestionById = async (questionId: string) => {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw createError.NotFound("Question not found with ID: " + questionId);
  }

  const deletedQuestion = await prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  return deletedQuestion;
};

export default {
  getQuestionsByQuizSetId,
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
  createBulkQuestions,
};
