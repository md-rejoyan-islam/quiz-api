import { StatusCodes } from "http-status-codes";

/**
 * Custom error class to handle application-specific errors.
 * Inherits from the built-in Error class and adds status codes, error type, and stack trace.
 */
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  details?: any;

  /**
   * Creates an instance of AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code associated with the error.
   */
  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    // Captures stack trace for debugging purposes
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Generates a BadRequest error with a 400 status code.
   * @param {string} message - The error message.
   * @returns {AppError} The AppError instance.
   */
  static badRequest(message: string, details?: any): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST, details);
  }

  /**
   * Generates an Unauthorized error with a 401 status code.
   * @param {string} message - The error message.
   * @returns {AppError} The AppError instance.
   */
  static unauthorized(message: string): AppError {
    return new AppError(message, StatusCodes.UNAUTHORIZED);
  }

  /**
   * Generates a Forbidden error with a 403 status code.
   * @param {string} message - The error message.
   * @returns {AppError} The AppError instance.
   */
  static forbidden(message: string): AppError {
    return new AppError(message, StatusCodes.FORBIDDEN);
  }

  /**
   * Generates a NotFound error with a 404 status code.
   * @param {string} message - The error message.
   * @returns {AppError} The AppError instance.
   */
  static notFound(message: string): AppError {
    return new AppError(message, StatusCodes.NOT_FOUND);
  }

  /**
   * Generates a Conflict error with a 409 status code.
   * @param {string} message - The error message.
   * @returns {AppError} The AppError instance.
   */
  static conflict(message: string): AppError {
    return new AppError(message, StatusCodes.CONFLICT);
  }

  /**
   * Generates an InternalServerError error with a 500 status code.
   * @param {string} message - The error message.
   * @returns {AppError} The AppError instance.
   */
  static internal(message: string): AppError {
    return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default AppError;
