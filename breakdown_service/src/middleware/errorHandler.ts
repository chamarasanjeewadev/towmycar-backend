import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/errorHandlingSetup';
import {
    AuthorizeError,
    NotFoundError,
    ValidationError,
 } from '../utils/error/errors';
 
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: err.errorType,
      message: err.message
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Invalid input data",
      details: err.array()
    });
  }

  // Handle specific error codes
  if (err.code === '23505') {
    return res.status(409).json({
      error: "UniqueConstraintViolation",
      message: "A record with this information already exists",
    });
  }

  // Default error response
  res.status(500).json({
    error: "InternalServerError",
    message: "An unexpected error occurred while processing your request"
  });
};