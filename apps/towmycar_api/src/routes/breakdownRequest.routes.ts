import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/userBreakdownRequest.service";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { PaginationQuerySchema } from "../dto/query.dto";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";

const router = express.Router();

// Updated route for anonymous breakdown request
router.post(
  "/anonymous-breakdown-request",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response =
        await service.BreakdownRequestService.createAnonymousCustomerAndBreakdownRequest(
          req.body as BreakdownRequestInput
        );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/breakdown-request",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response =
        await service.BreakdownRequestService.CreateBreakdownRequest(
          req.body as BreakdownRequestInput,
          req.userInfo
        );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/list",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, customerId } = req.userInfo;
      const { page, pageSize } = PaginationQuerySchema.parse(req.query);

      const { requests, totalCount } =
        await service.BreakdownRequestService.getPaginatedBreakdownRequestsByCustomerId(
          page,
          pageSize,
          customerId
        );

      res.status(200).json({
        data: requests,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/assignments/:requestId?",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = null;
      const requestId = req.params.requestId
        ? parseInt(req.params.requestId, 10)
        : undefined;

      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      if (requestId !== undefined && isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      const assignments =
        await service.BreakdownRequestService.getBreakdownAssignmentsByRequestId(
          requestId
        );
      res.status(200).json(assignments);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/assignment/:assignmentId/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId, 10);
      const { userStatus } = req.body;

      if (isNaN(assignmentId)) {
        return res.status(400).json({ error: "Invalid assignment ID" });
      }

      const updated =
        await service.BreakdownRequestService.updateUserStatusInBreakdownAssignment(
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
      next(error);
    }
  }
);

router.post(
  "/close-and-rate/:requestId",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      const { customerRating, customerFeedback } = req.body;

      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      if (
        typeof customerRating !== "number" ||
        customerRating < 1 ||
        customerRating > 5
      ) {
        return res
          .status(400)
          .json({ error: "Invalid rating. Must be a number between 1 and 5." });
      }

      if (typeof customerFeedback !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid feedback. Must be a string." });
      }

      await service.BreakdownRequestService.closeBreakdownAndUpdateRating(
        requestId,
        customerRating,
        customerFeedback
      );

      res
        .status(200)
        .json({ message: "Breakdown request closed and rated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Add this new route
router.get(
  "/breakdown-request/:requestId",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.requestId, 10);

      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      const breakdownRequest = await service.BreakdownRequestService.getBreakdownRequestById(requestId);

      res.status(200).json(breakdownRequest);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
