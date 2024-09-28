/// <reference types="../global" />

import { Request, Response, NextFunction } from "express";
import { ClerkExpressRequireAuth, clerkClient } from "@clerk/clerk-sdk-node";

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
        res.status(401).json({ error: "Authentication failed" });
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
            user.privateMetadata.userInfo;

          if (role !== requiredRole) {
            return res.status(403).json({ error: "Insufficient permissions" });
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
          return res.status(500).json({ error: "Internal server error" });
        }
      }

      next();
    });
  };
};
