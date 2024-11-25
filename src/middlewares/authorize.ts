import { NextFunction, Response } from "express";
import AppError from "../utils/app-errors";
import { RequestWithUser, UserRole } from "../utils/types";

const authorize = (roles: UserRole[]) => {
  return (req: RequestWithUser, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      throw AppError.forbidden(
        "You do not have permission to access this resource"
      );
    }
    next();
  };
};

export default authorize;
