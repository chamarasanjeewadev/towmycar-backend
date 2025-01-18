import { Request, Response, NextFunction } from "express";
import { clerkAuthMiddleware } from "./clerkAuth";
import { verifyTokenMiddleware } from "./tokenVerification";

export const tokenAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.body.token || req.query.token || req.headers["Authorization"];

  if (token) {
    // If token is present, use token verification
    return verifyTokenMiddleware(req, res, next);
  } else {
    // If no token, use Clerk authentication
    return clerkAuthMiddleware("customer")(req, res, next);
  }
};
