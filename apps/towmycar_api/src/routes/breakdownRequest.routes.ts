import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/userBreakdownRequest.service";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { PaginationQuerySchema } from "../dto/query.dto";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import { TokenService } from "@towmycar/common";
import { verifyTokenMiddleware } from "../middleware/tokenVerification";
import { combinedAuthMiddleware } from "../middleware/combinedAuth";
import { UserRepository } from "../repository/user.repository";

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

router.get("/assignments/:requestId", async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const assignments =
      await service.BreakdownRequestService.getBreakdownAssignmentsByRequestId(
        requestId
      );
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
  combinedAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      const {
        driverRating,
        driverFeedback,
        siteRating,
        siteFeedback,
        driverId,
      } = req.body;

      if (isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      // Validate ratings if provided
      const validateRating = (rating: number | null) => {
        return (
          rating === null ||
          (typeof rating === "number" && rating >= 1 && rating <= 5)
        );
      };

      if (!validateRating(driverRating) || !validateRating(siteRating)) {
        return res.status(400).json({
          error: "Invalid rating. Must be null or a number between 1 and 5.",
        });
      }

      // Validate feedbacks if provided
      const validateFeedback = (feedback: string | null) => {
        return feedback === null || typeof feedback === "string";
      };

      if (
        !validateFeedback(driverFeedback) ||
        !validateFeedback(siteFeedback)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid feedback. Must be null or a string." });
      }

      await service.BreakdownRequestService.closeBreakdownAndUpdateRating({
        requestId,
        driverRating,
        driverFeedback,
        siteRating,
        siteFeedback,
        driverId,
      });

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

      const breakdownRequest =
        await service.BreakdownRequestService.getBreakdownRequestById(
          requestId
        );

      res.status(200).json(breakdownRequest);
    } catch (error) {
      next(error);
    }
  }
);

// Add this new route
router.get(
  "/driver-rating/:driverId",
  clerkAuthMiddleware("customer"), // You can adjust the middleware as needed
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = parseInt(req.params.driverId, 10);

      if (isNaN(driverId)) {
        return res.status(400).json({ error: "Invalid driver ID" });
      }

      const ratingCount =
        await service.BreakdownRequestService.getDriverRatingCount(driverId);

      res.status(200).json(ratingCount);
    } catch (error) {
      next(error);
    }
  }
);

// Update the driver profile route to support review pagination
router.get(
  "/driver-profile/:requestId/:driverId",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = parseInt(req.params.driverId, 10);
      const requestId = parseInt(req.params.requestId, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

      if (isNaN(driverId) || isNaN(requestId)) {
        return res
          .status(400)
          .json({ error: "Invalid driver ID or request ID" });
      }

      const driverProfile =
        await service.BreakdownRequestService.getDriverProfile(
          driverId,
          requestId,
          page,
          pageSize
        );

      res.status(200).json(driverProfile);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
