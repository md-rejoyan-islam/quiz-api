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
    | "question"
    | "options"
    | "explanation"
    | "answerIndices"
    | "mark"
    | "quizSetId"
    | "time"
  >
) => {
  const createdQuestion = await prisma.question.create({
    data: {
      ...payload,
      options: JSON.stringify(payload.options),
      answerIndices: JSON.stringify(payload.answerIndices),
    },
  });
  return createdQuestion;
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
  const updatedQuestion = await prisma.question.update({
    where: {
      id: questionId,
    },
    data: {
      ...payload,
      options: JSON.stringify(payload.options),
      answerIndices: JSON.stringify(payload.answerIndices),
    },
  });
  if (!updatedQuestion) {
    throw createError.NotFound("Question not found with ID: " + questionId);
  }
  return updatedQuestion;
};

// delete question by ID
const deleteQuestionById = async (questionId: string) => {
  const deletedQuestion = await prisma.question.delete({
    where: {
      id: questionId,
    },
  });
  if (!deletedQuestion) {
    throw createError.NotFound("Question not found with ID: " + questionId);
  }
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
