import express, { Request, Response, NextFunction } from "express";
import {
  getDriverById,
  updateDriverProfile,
} from "../service/driver/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { DriverService } from "../service/driver/driver.service";
import { CustomError, ERROR_CODES } from "../utils/errorHandlingSetup";
import { driverProfileSchema } from "../dto/driver.dto";
import { DriverStatus } from "../enums";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import axios from "axios";
import Stripe from "stripe";
import { BreakdownRequestService } from "../service/user/userBreakdownRequest.service";

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
      let { status, estimation, explanation } = req.body;

      if (!driverId || !status) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "driverId and status are required"
        );
      }

      if (
        status !== DriverStatus.ACCEPTED &&
        status !== DriverStatus.REJECTED &&
        status !== DriverStatus.QUOTED &&
        status !== DriverStatus.CLOSED
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
        status,
        ...(parsedEstimation !== undefined && { estimation: parsedEstimation.toString() }),
        ...(explanation && { explanation }),
      };

      if (status === DriverStatus.ACCEPTED) {
        // Retrieve the driver's payment method ID
        const driver = await driverService.getDriverWithPaymentMethod(
          Number(driverId)
        );
        if (!estimation) {
          const breakdownAssignment =
            await BreakdownRequestService.getBreakdownAssignmentsByDriverIdAndRequestId(
              Number(driverId),
              Number(requestId)
            );
          estimation = breakdownAssignment?.estimation;
        }

        if (!driver || !driver.stripePaymentMethodId) {
          throw new CustomError(
            ERROR_CODES.INVALID_INPUT,
            400,
            "Driver's payment method not found"
          );
        }
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(estimation ?? 5) * 10), // Convert to cents and ensure it's an integer
            currency: "usd",
            customer: driver.stripeId,
            payment_method: driver.stripePaymentMethodId,
            off_session: true,
            confirm: true,
          });

          if (paymentIntent.status !== "succeeded") {
            throw new CustomError(
              ERROR_CODES.PAYMENT_FAILED,
              400,
              "Payment failed"
            );
          }
        } catch (error) {
          throw new CustomError(
            ERROR_CODES.PAYMENT_FAILED,
            400,
            "Payment processing failed"
          );
        }
      }

      // Update the assignment and breakdown request status
      const updated = await driverService.updateBreakdownAssignment(
        Number(driverId),
        Number(requestId),
        {
          ...dataToUpdate,
          ...(parsedEstimation !== undefined && { estimation: parsedEstimation.toString() }),
        }
      );

      if (updated) {
        res.json({ message: `Driver request status updated to ${status}` });
      } else {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "Driver request not found"
        );
      }
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

      const response = await axios.post(
        process.env.VEHICLE_REGISTRATION_API_URL!,
        { registrationNumber },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.VEHICLE_REGISTRATION_API_KEY!,
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        next(
          new CustomError(
            ERROR_CODES.DATABASE_ERROR,
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

export default router;
