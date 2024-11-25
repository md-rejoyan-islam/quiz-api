import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import quizService from "../services/quiz.service";
import { RequestWithUser } from "../utils/types";
import { successResponse } from "./../utils/response-handler";

/**
 * @method GET
 * @route  /api/quizzes
 * @description Get a list of all published quizzes based on query parameters for a user.
 * @access Public
 * @param {Response} res - Response object to send the response.
 * @returns {Array of Object} List of published quizzes.
 */
const listQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizService.listQuizzes({
    search: req.query.search as string, // search query for quiz title and description
  });

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
 * @route  /api/admin/quizzes
 * @description Get a list of all quizzes for admin view (including drafts) who created them.
 * @access Admin [only creator]
 * @param {Request} req - Request object.
 * @param {Response} res - Response object to send the response.
 * @returns {Array of Object} List of all quizzes.
 */
const listQuizzesForAdmin = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const result = await quizService.listQuizSetForAdmin(
      req.user?.id as string
    );

    successResponse(res, {
      statusCode: 200,
      message: "Quizzes fetched successfully",
      payload: {
        data: result,
      },
    });
  }
);

/**
 * @method POST
 * @route  /api/quizzes
 * @description Create a new quiz.
 * @access Private (Authenticated admin)
 * @param {RequestWithUser} req - Request object containing quiz details in body.
 * @param {Response} res - Response object to send the response.
 * @returns {Object} Created quiz details.
 */
const createQuiz = asyncHandler(async (req: RequestWithUser, res: Response) => {
  const quiz = await quizService.createQuiz(req.body, req.user?.id as string);

  successResponse(res, {
    statusCode: 201,
    message: "Quiz created successfully",
    payload: {
      data: quiz,
    },
  });
});

/**
 * @method PUT
 * @route  /api/quizzes/:id
 * @description Update an existing quiz.
 * @access Private (Authenticated creator admin of the quiz)
 * @param {Request} req - Request object containing quiz ID and updated data.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Updated quiz details.
 */
const updateQuiz = asyncHandler(async (req: RequestWithUser, res: Response) => {
  const quiz = await quizService.updateQuiz(
    req.params.id, // quiz ID
    req.body
  );
  successResponse(res, {
    statusCode: 200,
    message: "Quiz updated successfully",
    payload: {
      data: quiz,
    },
  });
});

/**
 * @method POST
 * @route  /api/quizzes/:quizId/questions
 * @description Add a question to a specific quiz by its ID for creator admin.
 * @access Private
 * @param {Request} req - Request object containing quiz ID and question data.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Added question details.
 */
const addQuestion = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const question = await quizService.addQuestion(req.params.quizId, req.body);

    successResponse(res, {
      statusCode: 201,
      message: "Question added successfully",
      payload: {
        data: question,
      },
    });
  }
);

/**
 * @method POST
 * @route  /api/quizzes/:quizId/questions/bulk
 * @description Add multiple questions to a quiz in bulk.
 * @access Private
 * @param {Request} req - Request object containing quiz ID and an array of questions.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Bulk addition result.
 */
const addBulkQuestions = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizService.addBulkQuestions(
    req.params.quizId as string,
    req.body
  );
  successResponse(res, {
    statusCode: 201,
    message: "Questions added successfully",
    payload: {
      data: result,
    },
  });
});

/**
 * @method GET
 * @route  /api/quizzes/:id
 * @description Fetch details of a specific quiz by its ID.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Quiz details.
 */
const getQuiz = asyncHandler(async (req: RequestWithUser, res: Response) => {
  const quiz = await quizService.getQuiz(req.params.id);

  successResponse(res, {
    statusCode: 200,
    message: "Quiz fetched successfully",
    payload: {
      data: quiz,
    },
  });
});

/**
 * @method POST
 * @route  /api/quizzes/:quizId/attempts
 * @description Submit a quiz attempt by a user.
 * @access Private
 * @param {RequestWithUser} req - Request object containing quiz ID and answers.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Attempt submission result.
 */
const submitAttempt = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const attempt = await quizService.submitQuizAttempt(
      req.user?.id as string,
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

/**
 * @method GET
 * @route  /api/quizzes/attempts
 * @description Fetch all quiz attempts for a user.
 * @access Private
 * @param {RequestWithUser} req - Request object.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} List of attempts.
 */
const getAttempts = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const attempts = await quizService.getUserAttempts(req.user?.id as string);

    successResponse(res, {
      statusCode: 200,
      message: "Attempts fetched successfully",
      payload: {
        data: attempts,
      },
    });
  }
);

/**
 * @description get quiz attempt by quiz id
 * @param {Request} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} List of attempts.
 * @access Private
 * @method GET
 * @route  /api/quizzes/:quizId/attempts
 * @param {Request} req - Request object containing quiz ID and pagination details.
 */
interface QuizAttemptQuery {
  page: number;
  limit: number;
}

const getQuizAttemptsByQuizId = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await quizService.getQuizAttemptsById(req.params.quizId, {
      page: parseInt(req.query.page as string, 10),
      limit: parseInt(req.query.limit as string, 10),
    } as QuizAttemptQuery);
    successResponse(res, {
      statusCode: 200,
      message: "Attempts fetched successfully",
      payload: {
        data: result,
      },
    });
  }
);

interface LeaderboardQuery {
  page: number;
  limit: number;
}

/**
 * @method GET
 * @route  /api/quizzes/:quizId/leaderboard
 * @description Get the leaderboard for a specific quiz.
 * @access Public
 * @param {Request} req - Request object containing quiz ID and pagination details.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Quiz leaderboard.
 */
const getQuizLeaderboardByQuizId = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await quizService.getQuizLeaderboardById(req.params.quizId, {
      page: parseInt(req.query.page as string, 10),
      limit: parseInt(req.query.limit as string, 10),
    } as LeaderboardQuery);
    successResponse(res, {
      statusCode: 200,
      message: "Leaderboard fetched successfully",
      payload: {
        data: result,
      },
    });
  }
);

/**
 * @method DELETE
 * @route  /api/quizzes/questions/:questionId
 * @description Delete a specific question from a quiz.
 * @access Private
 * @param {Request} req - Request object containing question ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Deletion result.
 */
const deleteQuestion = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const result = await quizService.deleteQuestion(req.params.questionId);

    successResponse(res, {
      statusCode: 200,
      message: "Question deleted successfully",
      payload: {
        data: result,
      },
    });
  }
);

/**
 * @method PUT
 * @route  /api/quizzes/questions/:questionId
 * @description Edit a specific question in a quiz.
 * @access Private
 * @param {Request} req - Request object containing question ID and updated data.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Updated question details.
 */
const editQuestion = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const result = await quizService.editQuestion(
      req.params.questionId,
      req.body
    );
    successResponse(res, {
      statusCode: 200,
      message: "Question updated successfully",
      payload: {
        data: result,
      },
    });
  }
);

/**
 * @method DELETE
 * @route  /api/quizzes/:quizId
 * @description Delete a quiz by its ID.
 * @access Private
 * @param {Request} req - Request object containing quiz ID.
 * @param {Response} res - Response object to send the response.
 * @returns {JSON} Deletion result.
 */
const deleteQuizSet = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    const result = await quizService.deleteQuizSet(req.params.quizId);
    successResponse(res, {
      statusCode: 200,
      message: "Quiz deleted successfully",
      payload: {
        data: result,
      },
    });
  }
);

export default {
  listQuizzes,
  listQuizzesForAdmin,
  createQuiz,
  updateQuiz,
  addQuestion,
  addBulkQuestions,
  getQuiz,
  submitAttempt,
  getAttempts,
  getQuizLeaderboardByQuizId,
  deleteQuestion,
  editQuestion,
  deleteQuizSet,
  getQuizAttemptsByQuizId,
};
