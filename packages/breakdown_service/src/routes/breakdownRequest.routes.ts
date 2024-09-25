import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/userBreakdownRequest.service";
import { clerkClient } from "@clerk/clerk-sdk-node";
import * as repository from "../repository/breakdownRequest.repository";
import {
  BreakdownRequestInput,
  BreakdownRequestSchema,
} from "../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestSchema } from "../dto/combinedBreakdownRequest.dto";
import { z } from "zod";
import { PaginationQuerySchema } from "../dto/query.dto";
import { validateRequest } from "../middleware/requestValidator";
import { errorHandler } from "../middleware/errorHandler";
import { authenticateJWT } from "../middleware/auth";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";

const router = express.Router();
// router.use(authenticateJWT(["user"]));
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Example authentication middleware
  const isValidUser = true;
  if (!isValidUser) {
    return res.status(403).json({ error: "authorization error" });
  }
  next();
};

// New route for combined breakdown request
router.post(
  "/combined-breakdown-request",
  clerkAuthMiddleware("customer"), // Check for "customer" role
  async (req: Request, res: Response) => {
    try {
      // Now you can access userId and userRole directly from the request
      const {userId,role,customerId,driverId} = req.userInfo;
      console.log("userId in route handler:", userId, "userRole:", role);
      const response = await service.CreateCombinedBreakdownRequest(
        req.body as BreakdownRequestInput,
       req.userInfo
      );
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing combined breakdown request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// New route for getting breakdown requests by user ID (paginated)
router.get(
  "/:id/list",
  authenticateJWT(["user"]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { page, pageSize } = PaginationQuerySchema.parse(req.query);

      const { breakdownRequests, totalCount } =
        await service.BreakdownRequestService.getPaginatedBreakdownRequestsWithUserDetails(
          page,
          pageSize,
          +id
        );

      res.status(200).json({
        data: breakdownRequests,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    } catch (error) {
      console.error("Error fetching breakdown requests:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// New route for getting user's breakdown assignments
router.get("/assignments/:requestId?", async (req: Request, res: Response) => {
  try {
    const userId = null; //parseInt(req.params.userId, 10);
    const requestId = req.params.requestId
      ? parseInt(req.params.requestId, 10)
      : undefined;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (requestId !== undefined && isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    console.log("req.params", req.params);
    const assignments =
      await service.BreakdownRequestService.getBreakdownAssignmentsByUserIdAndRequestId(
        userId,
        requestId
      );
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching user's breakdown assignments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Updated route for updating user status in breakdown assignment
router.patch(
  "/assignment/:assignmentId/status",
  async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId, 10);
      const { userStatus } = req.body;

      if (isNaN(assignmentId)) {
        return res.status(400).json({ error: "Invalid assignment ID" });
      }
      console.log("assignmentId", assignmentId);
      console.log("userStatus", userStatus);
      const updated =
        await service.BreakdownRequestService.updateDriverStatusInBreakdownAssignment(
          assignmentId,
          userStatus
        );

      if (updated) {
        res
          .status(200)
          .json({ message: "Assignment status updated successfully" });
      } else {
        res
          .status(404)
          .json({ error: "Assignment not found or update failed" });
      }
    } catch (error) {
      console.error(
        "Error updating user status in breakdown assignment:",
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Add error handling middleware at the end of your router
router.use(errorHandler);

export default router;
