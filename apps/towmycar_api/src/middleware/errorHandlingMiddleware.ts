import { Request, Response, NextFunction } from "express";
import { BaseError, CustomError, APIError, logger } from "@towmycar/common";

export const errorMiddleware = (
  err: BaseError | CustomError | APIError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let errorCode = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let code = "";

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
    `Status: ${statusCode}, Code: ${errorCode}, Message: ${message}, Stack: ${err.stack}`,
  );

  // Send response
  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    info: {
      message,
      errorCode,
      statusCode,
      // customeErrorCode: code
    },
    message: message,
  });
};
