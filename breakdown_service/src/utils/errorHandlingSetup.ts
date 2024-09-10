import winston from "winston";
import { Request, Response, NextFunction } from "express";

// Step 1: Set Up Winston for Logging
const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" }),
  ],
});

export const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DATABASE_ERROR: "DATABASE_ERROR",
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_INPUT]: "The input provided is invalid.",
  [ERROR_CODES.USER_ALREADY_EXISTS]: "A user with this email already exists.",
  [ERROR_CODES.RESOURCE_NOT_FOUND]: "The requested resource was not found.",
  [ERROR_CODES.DATABASE_ERROR]: "A database error occurred.",
};

// Step 3: Create a Custom Error Class
export class CustomError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, statusCode: number, message?: string) {
    super(message || ERROR_MESSAGES[code] || "An error occurred");
    this.code = code;
    this.statusCode = statusCode;
    this.name = "CustomError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // Log the error using winston
  logger.error(
    `Status: ${statusCode}, Code: ${
      err.code || "UNKNOWN_ERROR"
    }, Message: ${message}, Stack: ${err.stack}`
  );

  // Send response
  res.status(statusCode).json({
    status: "error",
    code: err.code || "INTERNAL_ERROR",
    message,
  });
};
