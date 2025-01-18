/// <reference types="../global" />

import { Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth, clerkClient } from "@clerk/clerk-sdk-node";
import { APIError, AuthError, AuthorizeError, ERROR_CODES } from "@towmycar/common";
import { verifyToken } from "@clerk/backend";
import cookieParser from "cookie-parser";
// interface ExtendedRequest extends Request {
//   userRole?: string;
//   clerkUserId?: string;
//   userId?: string;
// }

export const clerkAuthMiddleware = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Log the endpoint information
    console.log(`Endpoint called: ${req.method} ${req.originalUrl}`);

    ClerkExpressRequireAuth({
      onError: error => {
        console.error("Clerk authentication error:", error);
        // Return AuthorizeError instead of sending a response directly
        next(new AuthorizeError("Clerk authentication failed"));
      },
    })(req, res, async err => {
      if (err) {
        return next(err);
      }
      const authFromHeaders = req.headers.authorization?.split(" ")[1];
      const authTokenFromCookie = req.cookies["__session"];
      const authToken = authTokenFromCookie || authFromHeaders;

      try {
        const verifiedToken = await verifyToken(authToken, {
          secretKey: process.env.CLERK_SECRET_KEY,
          authorizedParties: [
            "http://localhost:3000",
            "https://towmycar.uk",
            "https://dev.towmycar.uk",
            "https://www.towmycar.uk",
            "https://l3uz0btv4l.execute-api.eu-west-2.amazonaws.com",
          ], // Replace with your authorized parties
        });
        const clerkUserId = req.auth?.userId ?? null;
        if (clerkUserId) {
          try {
            const { role, userId, customerId, driverId } =
              //@ts-ignore
              verifiedToken.metadata.userInfo;
            // const user = await clerkClient.users.getUser(clerkUserId);
            //NOTE: this is the old way of getting the user info, since it calls cleark backend try to get it from token itself,
            // TODO: make sure this is safe and not a security risk,
            // //@ts-ignore
            // const { role, userId, customerId, driverId } =
            //   user.privateMetadata?.userInfo || {};

            if (role !== requiredRole) {
              // Use AuthorizeError for insufficient permissions as well
              return next(
                new AuthorizeError("Insufficient permissions from clerk"),
              );
            }
            req.userInfo = {
              userId,
              role,
              customerId,
              driverId,
            };
            console.log("userId:", userId, "userRole:", req.userInfo);
          } catch (error) {
            console.error("Error fetching user data:", error);
            // Use APIError for internal server errors
            return next(
              new AuthError(
                ERROR_CODES.AUTH_ERROR,
                "Error fetching user data",
              ),
            );
          }
        }

        next();
      } catch (error) {
        console.error("Error verifying Auth token:", error);
        return next(
          new AuthError(ERROR_CODES.AUTH_ERROR, "Error verifying auth token"),
        );
      }
    });
  };
};
