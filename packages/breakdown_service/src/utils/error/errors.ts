import { STATUS_CODES } from "./status-codes";

export const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DATABASE_ERROR: "DATABASE_ERROR",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  STRIPE_CARD_NOT_ADDED: "STRIPE_CARD_NOT_ADDED",
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_INPUT]: "The input provided is invalid.",
  [ERROR_CODES.USER_ALREADY_EXISTS]: "A user with this email already exists.",
  [ERROR_CODES.RESOURCE_NOT_FOUND]: "The requested resource was not found.",
  [ERROR_CODES.DATABASE_ERROR]: "A database error occurred.",
  [ERROR_CODES.PAYMENT_FAILED]: "The payment process failed.",
  [ERROR_CODES.STRIPE_CARD_NOT_ADDED]: "Failed to add the Stripe card.",
};

export class BaseError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    name: string,
    statusCode: number,
    code: string,
    description: string
  ) {
    super(description);
    this.name = name;
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

// 500 Internal Error
export class APIError extends BaseError {
  constructor(
    code: string = ERROR_CODES.DATABASE_ERROR,
    description: string = ERROR_MESSAGES[ERROR_CODES.DATABASE_ERROR]
  ) {
    super("APIError", STATUS_CODES.INTERNAL_ERROR, code, description);
  }
}

// 400 Validation Error
export class ValidationError extends BaseError {
  constructor(
    code: string = ERROR_CODES.INVALID_INPUT,
    description: string = ERROR_MESSAGES[ERROR_CODES.INVALID_INPUT]
  ) {
    super("ValidationError", STATUS_CODES.BAD_REQUEST, code, description);
  }
}

// 403 Authorize error
export class AuthorizeError extends BaseError {
  constructor(description: string = "Access denied") {
    super(
      "AuthorizeError",
      STATUS_CODES.UN_AUTHORISED,
      "UNAUTHORIZED",
      description
    );
  }
}

// 404 Not Found
export class NotFoundError extends BaseError {
  constructor(
    description: string = ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND]
  ) {
    super(
      "NotFoundError",
      STATUS_CODES.NOT_FOUND,
      ERROR_CODES.RESOURCE_NOT_FOUND,
      description
    );
  }
}

// CustomError is now reintroduced
export class CustomError extends BaseError {
  constructor(code: string, statusCode: number, message?: string) {
    super(
      "CustomError",
      statusCode,
      code,
      message || ERROR_MESSAGES[code] || "An error occurred"
    );
  }
}
