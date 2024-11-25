import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodIssue } from "zod";
import AppError from "../utils/app-errors";

/**
 * Handle Zod validation errors
 * @param err - The Zod error object
 * @returns {AppError} - Custom error object for Zod validation errors
 */
const handleZodError = (err: ZodError): AppError => {
  const issues = err.issues.map((issue: ZodIssue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return AppError.badRequest("Validation error", { errors: issues });
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError =>
  AppError.unauthorized("Invalid token. Please log in again!");

/**
 * Handle expired JWT token errors
 */
const handleJWTExpiredError = (): AppError =>
  AppError.unauthorized("Your token has expired! Please log in again.");

/**
 * Handle Prisma unique constraint errors
 */
const handlePrismaUniqueConstraintError = (
  err: PrismaClientKnownRequestError
): AppError => {
  const message = `Duplicate field value: ${err.meta?.target}. Please use another value!`;
  return AppError.conflict(message);
};

/**
 * Handle Prisma validation errors
 */
const handlePrismaValidationError = (
  err: PrismaClientValidationError
): AppError => {
  const message = err.message;
  return AppError.badRequest(`Invalid input: ${message}`);
};

/**
 * Send error response in development environment
 */
const sendErrorDev = (err: any, res: Response): void => {
  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: err.status || "error",
    message: err.message || "An error occurred",
    stack: err.stack || null,
    error: {
      name: err.name || "Error",
      ...err, // Spread to include enumerable properties
      errors: err.errors || undefined, // Explicitly include errors (e.g., for ZodError)
    },
  });
};

/**
 * Send error response in production environment
 */
const sendErrorProd = (err: any, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.details?.errors || undefined,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong!",
      errors: err.details?.errors || undefined,
    });
  }
};

/**
 * Main error handler middleware
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";

  let error = err; // Avoid shallow copies to preserve original structure

  // Handle specific errors
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    error = handlePrismaUniqueConstraintError(error);
  }
  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === "P2025" // Not Found Error Code for Prisma
  ) {
    error = AppError.notFound("Resource not found.");
  }
  if (error instanceof PrismaClientValidationError) {
    error = handlePrismaValidationError(error);
  }
  if (error instanceof ZodError) {
    error = handleZodError(error);
  }

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default errorHandler;
