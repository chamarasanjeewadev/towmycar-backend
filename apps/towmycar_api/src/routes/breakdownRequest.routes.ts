import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/userBreakdownRequest.service";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { PaginationQuerySchema } from "../dto/query.dto";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import { combinedAuthMiddleware } from "../middleware/combinedAuth";
import {
  RequestIdParamSchema,
  DriverIdParamSchema,
  AssignmentIdParamSchema,
  RatingSchema,
} from "../dto/breakdownRequest.dto";
import {
  AnonymousBreakdownRequestSchema,
  UserStatusSchema,
  OptionalRequestIdParamSchema,
} from "../dto/breakdownRequest.dto";

const router = express.Router();

// Updated route for anonymous breakdown request
router.post(
  "/anonymous-breakdown-request",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = AnonymousBreakdownRequestSchema.parse({
        body: req.body,
      });

      const response =
        await service.BreakdownRequestService.createAnonymousCustomerAndBreakdownRequest(
          validatedData.body as BreakdownRequestInput
        );

      return res.status(200).json(response?.breakdownRequestResult);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/assignments/:requestId",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = RequestIdParamSchema.parse({
        requestId: req.params.requestId,
      });

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
      const { customerId } = req.userInfo;
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
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = OptionalRequestIdParamSchema.parse({
        requestId: req.params.requestId,
      });

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
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.userInfo;
    try {
      const { assignmentId } = AssignmentIdParamSchema.parse({
        assignmentId: req.params.assignmentId,
      });
      const { userStatus } = UserStatusSchema.parse(req.body);

      const updated =
        await service.BreakdownRequestService.updateUserStatusInBreakdownAssignment(
          assignmentId,
          userStatus,
          userId
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
      const { requestId } = RequestIdParamSchema.parse({
        requestId: req.params.requestId,
      });
      const ratingData = RatingSchema.parse(req.body);
      const driverId = req.tokenData?.driverId;

      await service.BreakdownRequestService.closeBreakdownAndUpdateRating({
        requestId,
        ...ratingData,
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
      const { requestId } = RequestIdParamSchema.parse({
        requestId: req.params.requestId,
      });

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
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { driverId } = DriverIdParamSchema.parse({
        driverId: req.params.driverId,
      });

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
      const { requestId } = RequestIdParamSchema.parse({
        requestId: req.params.requestId,
      });
      const { driverId } = DriverIdParamSchema.parse({
        driverId: req.params.driverId,
      });
      const { page, pageSize } = PaginationQuerySchema.parse(req.query);

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
