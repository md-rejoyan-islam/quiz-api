import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import quizService from "../services/quiz.service";
import { successResponse } from "../utils/response-handler";
import { RequestWithUser } from "../utils/types";

/**
 * @method POST
 * @route  /api/quiz-sets
 * @description Create a new quiz.
 * @access Private (Authenticated admin)
 * @param {RequestWithUser} req - Request object containing quiz details in body.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Created quiz details.
 */
const createQuizSet = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const quiz = await quizService.createQuizSet(req.body, req.user?.id!);

    successResponse(res, {
      statusCode: 201,
      message: "Quiz created successfully",
      payload: {
        data: quiz,
      },
    });
  }
);

/**
 * @method GET
 * @route  /api/quiz-sets
 * @description Get a list of all published quizzes based on query parameters for a user.
 * @access Public
 * @param {Response} res - Response object to send the response.
 * @returns {Array of Object} List of published quizzes.
 */
const getAllQuizzSets = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizService.getAllQuizSet();

  successResponse(res, {
    statusCode: 200,
    message: "Quizzes fetched successfully",
    payload: {
      data: result,
    },
  });
});

/**
 * @method GET
 * @route  /api/quiz-sets/:id
 * @description Fetch details of a specific quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Quiz details.
 */
const getQuizSetById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const quiz = await quizService.getQuizSetById(req.params.id);

    successResponse(res, {
      statusCode: 200,
      message: "Quiz fetched successfully",
      payload: {
        data: quiz,
      },
    });
  }
);

/**
 * @method PUT
 * @route  /api/quiz-sets/:id
 * @description Update an existing quiz.
 * @access Private (Authenticated creator admin of the quiz)
 * @param {Request} req - Request object containing quiz ID and updated data.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Updated quiz details.
 */
const updateQuizSetById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const quiz = await quizService.updateQuizSetById(req.params.id, req.body);
    successResponse(res, {
      statusCode: 200,
      message: "Quiz updated successfully",
      payload: {
        data: quiz,
      },
    });
  }
);

/**
 * @method DELETE
 * @route  /api/quiz-sets/:quizId
 * @description Delete a quiz by its ID.
 * @access Private
 * @param {Request} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Deletion result.
 */
const deleteQuizSetById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const result = await quizService.deleteQuizSetById(req.params.id);
    successResponse(res, {
      statusCode: 200,
      message: "Quiz deleted successfully",
      payload: {
        data: result,
      },
    });
  }
);

/** * @method GET
 * @route  /api/quiz-sets/:id/published
 * @description Fetch a published quiz by its ID.
 * @access Public
 * @param {RequestWithUser} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Published quiz details.
 * */
const publishedQuizSetById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const quiz = await quizService.publishQuizSetById(req.params.id);
    successResponse(res, {
      statusCode: 200,
      message: "Quiz fetched successfully",
      payload: {
        data: quiz,
      },
    });
  }
);

/**
 * @method POST
 * @route  /api/quiz-sets/:quizId/attempts
 * @description Submit a quiz attempt by a user.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and answers.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Attempt submission result.
 */
const attemptQuizSetById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const attempt = await quizService.attemptQuizSetById(
      req.user?.id!,
      req.params.quizId,
      req.body.answers
    );
    successResponse(res, {
      statusCode: 201,
      message: "Attempt submitted successfully",
      payload: {
        data: attempt,
      },
    });
  }
);

/** * @method POST
 * @route  /api/quiz-sets/:quizId/rate
 * @description Rate a quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and rating.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Rating result.
 * */
const rateQuizSetById = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const result = await quizService.rateQuizSetById(
      req.params.quizId,
      req.user?.id as string,
      req.body.rating
    );
    successResponse(res, {
      statusCode: 200,
      message: "Quiz rated successfully",
      payload: {
        data: result,
      },
    });
  }
);

/* * @method GET
 * @route  /api/quiz-sets/:quizId/attempts
 * @description Fetch all attempts for a specific quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {Array of Object} List of attempts for the quiz.
 */

const getQuizAttemptsByQuizId = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const attempts = await quizService.getQuizAttemptsByQuizId(
      req.params.quizId
    );
    successResponse(res, {
      statusCode: 200,
      message: "Quiz attempts fetched successfully",
      payload: {
        data: attempts,
      },
    });
  }
);

export default {
  createQuizSet,
  getAllQuizzSets,
  getQuizSetById,
  updateQuizSetById,
  deleteQuizSetById,
  publishedQuizSetById,
  attemptQuizSetById,
  rateQuizSetById,
  getQuizAttemptsByQuizId,
};
