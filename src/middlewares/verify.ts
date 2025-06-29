import { User } from "@prisma/client";
import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import secret from "../app/secret";
import prisma from "../config/prisma";
import { RequestWithUser } from "../utils/types";

const isLoggedIn = asyncHandler(
  async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    const token =
      req.headers?.authorization?.split("Bearer ")[1] || req.cookies?.token;

    // const token = authHeader?.split(" ")[1];

    if (!token || token === "null") {
      throw createError.Unauthorized("Please login to access this resource");
    }

    const decoded = jwt.verify(
      token,
      secret.jwt.accessTokenSecret as string
    ) as JwtPayload as Pick<User, "id" | "email" | "role">;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw createError.Unauthorized(
        "Login User not found or no longer exists!"
      );
    }

    const { password, createdAt, updatedAt, ...userWithOutPassword } = user;

    req.user = userWithOutPassword;
    next();
  }
);

const isLoggedOut = asyncHandler(
  async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.split(" ")[1];

    // check token
    const isValid = jwt.decode(token as string);

    if (isValid) {
      throw createError.Unauthorized("You are already logged in");
    }

    next();
  }
);

export default {
  isLoggedIn,
  isLoggedOut,
};
