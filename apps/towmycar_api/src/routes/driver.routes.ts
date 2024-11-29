import express, { Request, Response, NextFunction } from "express";
import {
  getDriverById,
  updateDriverProfile,
} from "../service/driver/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { DriverService } from "../service/driver/driver.service";
import { driverProfileSchema } from "../dto/driver.dto";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import axios from "axios";
import Stripe from "stripe";
import { BreakdownRequestService } from "../service/user/userBreakdownRequest.service";
import { CustomError, ERROR_CODES } from "../utils";
import { DriverStatus } from "@towmycar/common";

const router = express.Router();
const driverService = new DriverService();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Updated to the latest API version
});

router.get(
  "/assigned-requests",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId;
      if (isNaN(driverId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid driver ID"
        );
      }

      const assignments = await driverService.getDriverRequestsWithInfo(
        driverId
      );
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/assigned-request/:requestId",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId;
      const requestId = parseInt(req.params.requestId);
      if (isNaN(driverId) || isNaN(requestId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid driver ID or request ID"
        );
      }

      const assignment = await driverService.getDriverRequestWithInfo(
        driverId,
        requestId
      );
      if (!assignment) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "Driver request not found"
        );
      }
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/assignment-update/:requestId",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId;
      const requestId = parseInt(req.params.requestId);
      let { driverStatus, estimation, explanation } = req.body;

      if (!driverId || !driverStatus) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "driverId and status are required"
        );
      }

      if (
        driverStatus !== DriverStatus.ACCEPTED &&
        driverStatus !== DriverStatus.REJECTED &&
        driverStatus !== DriverStatus.QUOTED &&
        driverStatus !== DriverStatus.CLOSED
      ) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          'Status must be "ACCEPTED", "REJECTED", "QUOTED", or "CLOSED"'
        );
      }

      let parsedEstimation: number | undefined;
      if (estimation !== undefined) {
        parsedEstimation = Number(estimation);
        if (isNaN(parsedEstimation)) {
          throw new CustomError(
            ERROR_CODES.INVALID_INPUT,
            400,
            "Estimation must be a valid number"
          );
        }
      }

      const dataToUpdate = {
        driverStatus: driverStatus,
        ...(parsedEstimation !== undefined && {
          estimation: parsedEstimation.toString(),
        }),
        ...(explanation && { explanation }),
      };

      if (driverStatus === DriverStatus.ACCEPTED) {
        if (!estimation) {
          const breakdownAssignment =
            await BreakdownRequestService.getBreakdownAssignmentsByDriverIdAndRequestId(
              Number(driverId),
              Number(requestId)
            );
          estimation = breakdownAssignment?.estimation;
        }

        await driverService.processPaymentAndUpdateAssignment(
          Number(driverId),
          Number(requestId),
          Number(estimation ?? 5),
          dataToUpdate
        );
      } else {
        // Update the assignment without payment processing
        const updated = await driverService.updateBreakdownAssignment(
          Number(driverId),
          Number(requestId),
          dataToUpdate
        );

        if (!updated) {
          throw new CustomError(
            ERROR_CODES.RESOURCE_NOT_FOUND,
            404,
            "Driver request not found"
          );
        }
      }

      res.json({
        message: `Driver request status updated to ${driverStatus}`,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/profile",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;

      const driverProfile = await getDriverById(userId, DriverRepository);
      if (!driverProfile) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "Driver profile not found"
        );
      }

      res.json(driverProfile);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/profile",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId;
      if (isNaN(driverId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid driver ID"
        );
      }

      const result = driverProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid profile data: " + result.error.message
        );
      }

      const updatedDriver = await updateDriverProfile(
        driverId,
        result.data,
        DriverRepository
      );

      res.json({
        message: "Driver profile updated successfully",
        driver: updatedDriver,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verify-vehicle-registration",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { registrationNumber } = req.body;

      if (!registrationNumber) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Registration number is required"
        );
      }

      const apiUrl = `${process.env.VEHICLE_REGISTRATION_API_URL}`;
      const apiKey = process.env.VEHICLE_REGISTRATION_API_KEY;

      const response = await axios.get(apiUrl, {
        params: {
          apikey: apiKey,
          vrm: registrationNumber,
        },
      });

      res.json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        next(
          new CustomError(
            ERROR_CODES.RESOURCE_NOT_FOUND,
            error.response?.status || 500,
            error.response?.data?.message ||
              "Error verifying vehicle registration"
          )
        );
      } else {
        next(error);
      }
    }
  }
);

router.post(
  "/close-and-rate/:requestId",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId; // Retrieve driverId from userInfo
      const { markAsCompleted, reason } = req.body; // Extract from req.body
      const requestId = parseInt(req.params.requestId, 10);

      if (isNaN(requestId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid request ID"
        );
      }

      
      await driverService.closeBreakdownRequestAndUpdateRating({
        driverId,
        requestId,
        markAsCompleted,
       reason }
      );

      res
        .status(200)
        .json({ message: "Breakdown request closed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/notifications",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;
      const notifications = await driverService.getDriverNotifications(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/notifications/:notificationId/isSeen",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      if (isNaN(notificationId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid notification ID"
        );
      }
      await driverService.markNotificationAsSeen(notificationId);
      res.json({ message: "Notification marked as seen" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
