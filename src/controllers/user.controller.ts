import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import userService from "../services/user.service";
import { successResponse } from "../utils/response-handler";

/**
 * @method GET
 * @route /users
 * @description Get all users
 * @returns { status: string, data: Array<User> }
 * @error { status: string, message: string }
 */
const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.allUsers();
  successResponse(res, {
    statusCode: 200,
    message: "Users fetched successfully",
    payload: {
      data: users,
    },
  });
});
/**
 * @route GET /users/:id
 * @description Get a user by ID
 * @param { string } id - User ID
 * @returns { status: string, data: User }
 * @error { status: string, message: string }
 */
const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await userService.getUserById(userId);
  successResponse(res, {
    statusCode: 200,
    message: "User fetched successfully",
    payload: {
      data: user,
    },
  });
});

/**
 * @route PUT /users/:id
 * @description Update a user by ID
 * @param { string } id - User ID
 * @body { fullName?: string, email?: string, password?: string }
 * @returns { status: string, data: User }
 * @error { status: string, message: string }
 */
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const updateData = req.body;

  const updatedUser = await userService.updateUserById(userId, updateData);
  successResponse(res, {
    statusCode: 200,
    message: "User updated successfully",
    payload: {
      data: updatedUser,
    },
  });
});

/**
 * @route DELETE /users/:id
 * @description Delete a user by ID
 * @param { string } id - User ID
 * @returns { status: string, message: string }
 * @error { status: string, message: string }
 */
const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const deletedUser = await userService.deleteUserById(userId);
    successResponse(res, {
      statusCode: 200,
      message: "User deleted successfully",
      payload: {
        data: deletedUser,
      },
    });
  }
);

/**
 * @route GET /users/:id/quizzes
 * @description Get quizzes created by a user
 * @param { string } id - User ID
 * @returns { status: string, data: Array<QuizSet> }
 * @error { status: string, message: string }
 */
const getUserQuizzesById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const quizzes = await userService.getUserQuizzesById(userId);

    successResponse(res, {
      statusCode: 200,
      message: "Quizzes fetched successfully",
      payload: {
        data: quizzes,
      },
    });
  }
);

/**
 * @route GET /users/:id/attempts
 * @description Get quiz attempts made by a user
 * @param { string } id - User ID
 * @returns { status: string, data: Array<Attempt> }
 * @error { status: string, message: string }
 */
const getUserAttemptsById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const attempts = await userService.getUserAttemptsById(userId);
    successResponse(res, {
      statusCode: 200,
      message: "Quiz attempts fetched successfully",
      payload: {
        data: attempts,
      },
    });
  }
);

/**
 * @route GET /users/:id/ratings
 * @description Get quiz ratings given by a user
 * @param { string } id - User ID
 * @returns { status: string, data: Array<QuizSetRating> }
 * @error { status: string, message: string }
 */
const getUserRatingsById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const ratings = await userService.getUserRatingsById(userId);
    successResponse(res, {
      statusCode: 200,
      message: "Quiz ratings fetched successfully",
      payload: {
        data: ratings,
      },
    });
  }
);

// ban a user

/**
 * @route POST /users/:id/ban
 * @description Ban a user by ID
 * @param { string } id - User ID
 * @returns { status: string, message: string }
 * @error { status: string, message: string }
 *
 */

const banUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // Logic to ban the user (e.g., update user status in the database)
    const bannedUser = await userService.bannedUserById(userId);
    successResponse(res, {
      statusCode: 200,
      message: "User banned successfully",
      payload: {
        data: bannedUser,
      },
    });
  }
);

/**
 * @route POST /users/:id/unban
 * @description Unban a user by ID
 * @param { string } id - User ID
 * @returns { status: string, message: string }
 * @error { status: string, message: string }
 */
const unbanUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const unbannedUser = await userService.unbannedUserById(userId);
    successResponse(res, {
      statusCode: 200,
      message: "User unbanned successfully",
      payload: {
        data: unbannedUser,
      },
    });
  }
);

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserQuizzesById,
  getUserAttemptsById,
  getUserRatingsById,
  banUserById,
  unbanUserById,
};
