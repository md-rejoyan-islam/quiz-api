import { User, USER_STATUS } from "@prisma/client";
import createError from "http-errors";
import prisma from "../config/prisma";

// get all users service
const allUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      bio: true,
      status: true,
      photo: true,
      createdAt: true,
      updatedAt: true,
      role: true,
    },
  });
  if (!users || users.length === 0) {
    throw createError.NotFound("No users found");
  }

  return users;
};

// get user by ID service
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

  const { password, createdAt, updatedAt, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

// update user by ID service
const updateUserById = async (
  userId: string,
  data: Pick<
    User,
    "fullName" | "email" | "bio" | "status" | "photo" | "password"
  >
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
    },
  });
  if (!updatedUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }
  const { password, createdAt, updatedAt, ...userWithoutPassword } =
    updatedUser;
  return userWithoutPassword;
};

// delete user by ID service
const deleteUserById = async (userId: string) => {
  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  });
  if (!deletedUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }
  const { password, createdAt, updatedAt, ...userWithoutPassword } =
    deletedUser;
  return userWithoutPassword;
};

// get user quizzes by ID service
const getUserQuizzesById = async (userId: string) => {
  const quizzes = await prisma.quizSet.findMany({
    where: { userId },
    include: {
      questions: true,
    },
  });

  if (!quizzes || quizzes.length === 0) {
    throw createError.NotFound(`No quizzes found for user with ID ${userId}`);
  }

  return quizzes;
};

// get user attempts by ID service
const getUserAttemptsById = async (userId: string) => {
  const attempts = await prisma.attempt.findMany({
    where: { userId },
  });
  if (!attempts || attempts.length === 0) {
    throw createError.NotFound(`No attempts found for user with ID ${userId}`);
  }

  return attempts;
};

// get user ratings by ID service
const getUserRatingsById = async (userId: string) => {
  const ratings = await prisma.quizSetRating.findMany({
    where: { userId },
  });
  if (!ratings || ratings.length === 0) {
    throw createError.NotFound(`No ratings found for user with ID ${userId}`);
  }
  return ratings;
};

// ban a user by ID service
const bannedUserById = async (userId: string) => {
  const bannedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status: USER_STATUS.INACTIVE,
    },
  });
  if (!bannedUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }
  const { password, createdAt, updatedAt, ...userWithoutPassword } = bannedUser;
  return userWithoutPassword;
};

// unban a user by ID service
const unbannedUserById = async (userId: string) => {
  const unbannedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status: USER_STATUS.ACTIVE,
    },
  });
  if (!unbannedUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }
  const { password, createdAt, updatedAt, ...userWithoutPassword } =
    unbannedUser;
  return userWithoutPassword;
};

export default {
  allUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserQuizzesById,
  getUserAttemptsById,
  getUserRatingsById,
  bannedUserById,
  unbannedUserById,
};
