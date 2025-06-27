import { NextFunction, Response } from "express";
import createError from "http-errors";

import { ROLE } from "@prisma/client";
import { RequestWithUser } from "../utils/types";

export const authorize = (roles: ROLE[]) => {
  return (req: RequestWithUser, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as ROLE)) {
      console.log("Unauthorized access attempt by user:", req.user);

      throw createError.Forbidden(
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
