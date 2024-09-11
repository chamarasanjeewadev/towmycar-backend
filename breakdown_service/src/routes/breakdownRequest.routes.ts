import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/userBreakdownRequest.service";
import * as service2 from "../service/driver/breakdown.service";
import * as repository from "./../repository/breakdownRequest.repository";
import {
  BreakdownRequestInput,
  BreakdownRequestSchema,
} from "./../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestSchema } from "../dto/combinedBreakdownRequest.dto";
import { z } from "zod";

const router = express.Router();

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

router.post(
  "/breakdownrequest",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const result = BreakdownRequestSchema.safeParse(req.body);
      console.log("breakdown request ", result);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      console.log("inside create breakdown request post", req.body);

      // Save to database
      const response = await service.createAndNotifyBreakdownRequest(
        req.body as BreakdownRequestInput,
        repository.BreakdownRequestRepository
      );
      console.log(response);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error creating breakdown request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// New route for combined breakdown request
router.post(
  "/combined-breakdown-request",
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = CombinedBreakdownRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      // Call service method to handle combined request
      const response = await service2.CreateCombinedBreakdownRequest(
        result.data as any,
        req.body.userId
      );
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing combined breakdown request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// New route for getting breakdown requests by user ID (paginated)
router.get("/:id/list", async (req: Request, res: Response) => {
  try {
    const querySchema = z.object({
      page: z.string().regex(/^\d+$/).transform(Number).default("1"),
      pageSize: z.string().regex(/^\d+$/).transform(Number).default("10"),
    });

    const { id } = req.params;
    const { page, pageSize } = querySchema.parse(req.query);

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
});

// New route for getting user's breakdown assignments
router.get(
  "/:userId/assignments/:requestId?",
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
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
  }
);

// New route for updating user status in breakdown assignment
router.patch(
  "/assignment/:assignmentId/status",
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        assignmentId: z.string().regex(/^\d+$/).transform(Number),
        userStatus: z.enum(["accepted", "rejected"]),
      });

      const { assignmentId } = schema.parse({
        ...req.params,
        ...req.body,
      });

      const updated = await service.BreakdownRequestService.updateDriverStatusInBreakdownAssignment(
        assignmentId,
        req.body.userStatus
      );

      if (updated) {
        res.status(200).json({ message: "Assignment status updated successfully" });
      } else {
        res.status(404).json({ error: "Assignment not found or update failed" });
      }
    } catch (error) {
      console.error("Error updating user status in breakdown assignment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
