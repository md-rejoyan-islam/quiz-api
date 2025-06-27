import { Prisma } from "@prisma/client";
import { ErrorRequestHandler } from "express";
import {
  BadRequest,
  Conflict,
  InternalServerError,
  isHttpError,
  NotFound,
  UnprocessableEntity,
} from "http-errors";
import { ZodError } from "zod";

interface IErrorResponse {
  success: boolean;
  message: string;
  errors: { path: string | number; message: string }[];
  stack?: string;
}

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode: number = InternalServerError().statusCode;
  let message = "Something went wrong!";
  let errors: { path: string | number; message: string }[] = [];

  // jwt error
  // json web token errors
  if (error.name === "JsonWebTokenError") {
    statusCode = BadRequest().statusCode;
    error.message = "Invalid token. Please log in again!";
    errors = [{ path: "", message: "Invalid token. Please log in again!" }];
  }
  // 2. Handle JWT expired errors
  if (error.name === "TokenExpiredError") {
    statusCode = BadRequest().statusCode;
    error.message = "Your token has expired! Please log in again.";
    errors = [
      { path: "", message: "Your token has expired! Please log in again." },
    ];
  }

  // end jwt error

  // 1. Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = UnprocessableEntity().statusCode;
    message = "Validation Error";
    errors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  // 2. Handle Prisma unique constraint errors
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    statusCode = Conflict().statusCode;
    message = "Duplicate field value";
    errors = [
      {
        path: Array.isArray(error.meta?.target)
          ? (error.meta?.target as string[]).join(", ")
          : typeof error.meta?.target === "string"
          ? error.meta?.target
          : "",
        message: `Duplicate field value: ${error.meta?.target}. Please use another value!`,
      },
    ];
  } else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    statusCode = NotFound().statusCode;
    message = "Record not found";
    errors = [{ path: "", message: "The requested record does not exist." }];
  }

  // 2. Handle Prisma validation errors
  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = BadRequest().statusCode;
    console.log(error);

    message = "Invalid input";
    errors = [{ path: "", message: error.message }];
  }

  // 2. Handle Prisma client errors
  else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = InternalServerError().statusCode;
    message = "Database connection failed";
    errors = [{ path: "", message: "Failed to connect to the database." }];
  }
  // 2. Handle Prisma client errors
  else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = InternalServerError().statusCode;
    message = "Database operation failed";
    errors = [
      { path: "", message: "A database operation failed unexpectedly." },
    ];
  }

  // 3. Handle errors from the http-errors library
  else if (isHttpError(error)) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.message ? [{ path: "", message: error.message }] : [];
  }
  // 4. Handle generic Error
  else if (error instanceof Error) {
    message = error.message;
    errors = error.message ? [{ path: "", message: error.message }] : [];
  }

  const response: IErrorResponse = {
    success: false,
    message,
    errors,
  };

  // In development, include the stack trace
  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
