import express, { Request, Response, NextFunction } from "express";
import {
  getDriverById,
  registerDriver,
  updateDriverProfile,
} from "../service/driver/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { DriverService } from "../service/driver/driver.service";
import { CustomError, ERROR_CODES } from "../utils/errorHandlingSetup";
import { driverProfileSchema } from "../dto/driver.dto";
import { DriverStatus } from "../enums";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import { getUserProfileById } from "src/service/user/user.service";
import axios from "axios";

const router = express.Router();
const driverService = new DriverService();

// Remove the "/driver" prefix from all routes
/**
 * @deprecated This route is no longer in use. Driver registration is now handled through Clerk.
 */
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, userType } = req.body;
      if (!username || !email || !password) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Username, email, and password are required"
        );
      }
      if (userType === "driver") {
        const newDriver = await registerDriver(
          username,
          email,
          password,
          DriverRepository
        );
        res.status(201).json({
          message: "Driver registered successfully",
          driver: newDriver,
        });
      } else {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          401,
          "Invalid user type for driver registration"
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/assigned-requests",clerkAuthMiddleware("driver"),
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
      const { status, estimation, explanation } = req.body;
      
      if (!driverId || !status) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "driverId and status are required"
        );
      }

      if (status !== DriverStatus.ACCEPTED && status !== DriverStatus.REJECTED && status !== DriverStatus.QUOTED) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          'Status must be either "accepted" or "rejected"'
        );
      }

      if (estimation !== undefined && typeof estimation !== "number") {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Estimation must be a number representing money"
        );
      }

      const updateData = {
        status,
        ...(estimation !== undefined && { estimation }),
        ...(explanation !== undefined && { explanation }),
      };

      const updated = await driverService.updateBreakdownAssignment(
        Number(driverId),
        Number(requestId),
        updateData
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
      
      const driverProfile = await getDriverById(userId,DriverRepository);
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
  "/profile",clerkAuthMiddleware("driver"),
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
        next(new CustomError(
          ERROR_CODES.DATABASE_ERROR,
          error.response?.status || 500,
          error.response?.data?.message || "Error verifying vehicle registration"
        ));
      } else {
        next(error);
      }
    }
  }
);

export default router;
