import { User, USER_STATUS } from "@prisma/client";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import prisma from "../config/prisma";

// get all users service
const allUsers = async ({
  page,
  limit,
  skip,
}: {
  page: number;
  limit: number;
  skip: number;
}) => {
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
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
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      page,
      limit,
      totalPages,
      totalItems: total,
    },
    users,
  };
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
  data: Pick<User, "fullName" | "bio" | "status" | "photo" | "password">
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

  if (data.password) {
    data.password = bcrypt.hashSync(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      bio: data.bio,
      status: data.status,
      photo: data.photo,
      password: data.password || existingUser.password,
    },
  });

  const { password, createdAt, updatedAt, ...userWithoutPassword } =
    updatedUser;
  return userWithoutPassword;
};

// delete user by ID service
const deleteUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  const { password, createdAt, updatedAt, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// get user quizzes by ID service
const getUserQuizzesById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

  const quizzes = await prisma.quizSet.findMany({
    where: { userId },
    include: {
      questions: true,
    },
  });

  return (
    quizzes?.map((quiz) => ({
      ...quiz,
      tags: JSON.parse(quiz.tags),
    })) || []
  );
};

// get user attempts by ID service
const getUserAttemptsById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

  const attempts = await prisma.attempt.findMany();

  return (
    attempts.map((attempt) => ({
      ...attempt,
      submittedAnswers: JSON.parse(attempt.submittedAnswers),
    })) || []
  );
};

// get user ratings by ID service
const getUserRatingsById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

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
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }
  if (existingUser.role === "ADMIN") {
    throw createError.Forbidden("Can' update an admin");
  }
  if (existingUser.status === "INACTIVE") {
    throw createError.Forbidden("User is already inactive.");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: USER_STATUS.INACTIVE,
    },
  });

  const { password, createdAt, updatedAt, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// unban a user by ID service
const unbannedUserById = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw createError.NotFound(`User with ID ${userId} not found`);
  }

  if (existingUser.status === "ACTIVE") {
    throw createError.Forbidden("User is already active.");
  }
  if (existingUser.role === "ADMIN") {
    throw createError.Forbidden("Can' update an admin");
  }

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
