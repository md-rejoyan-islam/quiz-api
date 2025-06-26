import { NextFunction, Response } from "express";
import createError from "http-errors";
import { USER_ROLE } from "../types";
import AppError from "../utils/app-errors";
import { RequestWithUser } from "../utils/types";

export const authorize = (roles: USER_ROLE[]) => {
  return (req: RequestWithUser, _res: Response, next: NextFunction) => {
    if (
      !req.user ||
      !roles.includes(req.user.role.toLowerCase() as USER_ROLE)
    ) {
      throw AppError.forbidden(
        "You do not have permission to access this resource"
      );
    }
    next();
  };
};

// admin and only owner of this data , can access this.
export const authorizeOwnerOrAdmin = (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
) => {
  const loggedInUser = req.user;
  const targetUserId = req.params.id;

  if (!loggedInUser) {
    throw createError.Unauthorized("Unauthorized user.");
  }

  const isAdmin = loggedInUser.role.toLowerCase() === "admin";
  const isOwner = loggedInUser.id === targetUserId;

  if (isAdmin) {
    return next();
  } else if (!isAdmin && !isOwner) {
    throw createError.Forbidden("Not allowed to access this resource.");
  }

  next();
};
