import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { z } from "zod";
import secret from "../app/secret";
import { UserSchema } from "../schema/user.schema";
import AppError from "../utils/app-errors";
import { RequestWithUser } from "../utils/types";

const isLoggedIn = asyncHandler(
  async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;

    const token = authHeader?.split(" ")[1];

    if (!token || token === "null") {
      throw AppError.unauthorized("Please login to access this resource");
    }

    try {
      const decoded = jwt.verify(
        token,
        secret.jwt.accessTokenSecret as string
      ) as z.infer<typeof UserSchema>;

      req.user = decoded; // Attach the decoded token to the request
      next();
    } catch (err) {
      throw AppError.unauthorized("Invalid or expired token");
    }
  }
);

const isLoggedOut = asyncHandler(
  async (req: RequestWithUser, _res: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.split(" ")[1];

    // check token
    const isValid = jwt.decode(token as string);

    if (isValid) {
      throw AppError.unauthorized("You are already logged in");
    }

    next();
  }
);

export default {
  isLoggedIn,
  isLoggedOut,
};
