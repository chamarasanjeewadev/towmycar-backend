import winston from "winston";
import { Request, Response, NextFunction } from "express";
import { BaseError, CustomError, APIError } from "../utils";

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

export const errorMiddleware = (
  err: BaseError | CustomError | APIError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  debugger;
  let statusCode = 500;
  let errorCode = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let code = "";

  // if (err instanceof BaseError) {
  //   statusCode = err.statusCode;
  //   message = err.message;
  //   errorCode = err.name;
  //   code=err.code
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errorCode = err.code;
  } else if (err instanceof APIError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.name;
  } else {
    message = err.message;
    errorCode = err.name;
    code = err.stack;
  }

  // Log the error using winston
  logger.error(
    `Status: ${statusCode}, Code: ${errorCode}, Message: ${message}, Stack: ${err.stack}`
  );

  // Send response
  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    info: { message, errorCode, statusCode, customeErrorCode: code },
    message: message,
  });
};
