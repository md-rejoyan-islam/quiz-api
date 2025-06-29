import { Response } from "express";
import asyncHandler from "express-async-handler";
import questionService from "../services/question.service";
import { successResponse } from "../utils/response-handler";
import { RequestWithUser } from "../utils/types";

/**
 * @method GET
 * @route  /:quizId/questions
 * @description Fetch all questions for a specific quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {Array of Object} List of questions for the quiz.
 * */

const getQuestionsByQuizSetId = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const questions = await questionService.getQuestionsByQuizSetId(
      req.params.id
    );

    successResponse(res, {
      statusCode: 200,
      message: "Questions fetched successfully",
      payload: {
        data: questions,
      },
    });
  }
);

// create a new question
/**
 * @method POST
 * @route  /:quizId/questions
 * @description Create a new question for a specific quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and question details in body.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Created question details.
 * @throws {Error} If the question creation fails.
 */

const createQuestion = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;

    const question = await questionService.createQuestion(id, req.body);
    successResponse(res, {
      statusCode: 201,
      message: "Question created successfully",
      payload: {
        data: question,
      },
    });
  }
);

// bulk create questions
/** * @method POST
 * @route  /:quizId/questions/bulk
 * @description Create multiple questions for a specific quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and an array of question details in body.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Created questions details.
 * @throws {Error} If the question creation fails.
 */
const createBulkQuestions = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;

    const questions = await questionService.createBulkQuestions(id, req.body);
    successResponse(res, {
      statusCode: 201,
      message: "Questions created successfully",
      payload: {
        data: questions,
      },
    });
  }
);

/** * @method GET
 * @route  /:quizId/questions/:questionId
 * @description Fetch a specific question by its ID for a specific quiz.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and question ID.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Question details.
 * @throws {Error} If the question retrieval fails.
 */
const getQuestionById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const question = await questionService.getQuestionById(req.params.id);

    successResponse(res, {
      statusCode: 200,
      message: "Question fetched successfully",
      payload: {
        data: question,
      },
    });
  }
);

// update a question
/**
 * @method PUT
 * @route  /:quizId/questions/:questionId
 * @description Update a specific question by its ID for a specific quiz.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID, question ID, and updated question details in body.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Updated question details.
 * @throws {Error} If the question update fails.
 */

const updateQuestionById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const question = await questionService.updateQuestionById(
      req.params.id,
      req.body
    );
    successResponse(res, {
      statusCode: 200,
      message: "Question updated successfully",
      payload: {
        data: question,
      },
    });
  }
);

// delete a question
/** * @method DELETE
 * @route  /:quizId/questions/:questionId
 * @description Delete a specific question by its ID for a specific quiz.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and question ID.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Success message.
 * @throws {Error} If the question deletion fails.
 */

const deleteQuestionById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const question = await questionService.deleteQuestionById(req.params.id);

    successResponse(res, {
      statusCode: 200,
      message: "Question deleted successfully",
      payload: {
        data: question,
      },
    });
  }
);

export default {
  getQuestionsByQuizSetId,
  createQuestion,
  updateQuestionById,
  deleteQuestionById,
  getQuestionById,
  createBulkQuestions,
};
