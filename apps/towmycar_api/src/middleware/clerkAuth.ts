/// <reference types="../global" />

import { Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth, clerkClient } from "@clerk/clerk-sdk-node";
import { APIError, AuthorizeError } from "@towmycar/common";

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

      const clerkUserId = req.auth?.userId ?? null;

      if (clerkUserId) {
        try {
          const user = await clerkClient.users.getUser(clerkUserId);
          //@ts-ignore
          const { role, userId, customerId, driverId } =
            user.privateMetadata?.userInfo||{};

          if (role !== requiredRole) {
            // Use AuthorizeError for insufficient permissions as well
            return next(new AuthorizeError("Insufficient permissions from clerk"));
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
          return next(new APIError("Error fetching user data"));
        }
      }

      next();
    });
  };
};
