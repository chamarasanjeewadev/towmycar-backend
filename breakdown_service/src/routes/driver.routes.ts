import express, { Request, Response, NextFunction } from "express";
import { DriverSchema } from "../dto/driver.dto";
import { registerDriver, updateDriverProfile } from "../service/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { authenticateJWT } from "../middleware/auth";
import { DriverService } from "../service/driver.service";
import { CustomError, ERROR_CODES } from "../utils/errorHandlingSetup";
const router = express.Router();
const driverService = new DriverService();

// Remove the "/driver" prefix from all routes
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Username, email, and password are required"
        );
      }

      const newDriver = await registerDriver(username, email, password, DriverRepository);

      res
        .status(201)
        .json({ message: "Driver registered successfully", driver: newDriver });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:driverId/assigned-requests",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = parseInt(req.params.driverId);
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
  "/:driverId/assigned-request/:requestId",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = parseInt(req.params.driverId);
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
  "/:driverId/assignment-update/:requestId",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { driverId, requestId } = req.params;
      const { status, estimation, description } = req.body;
      console.log("backend fired", driverId, status, estimation, description);
      if (!driverId || !status) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "driverId and status are required"
        );
      }

      if (status !== "accepted" && status !== "rejected") {
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
        ...(description !== undefined && { description }),
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

router.patch(
  "/:driverId/profile",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = parseInt(req.params.driverId);
      if (isNaN(driverId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid driver ID"
        );
      }

      const result = DriverSchema.partial().safeParse(req.body);
      if (!result.success) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid profile data"
        );
      }

      const updatedDriver = await updateDriverProfile(driverId, result.data, DriverRepository);

      res.json({ message: "Driver profile updated successfully", driver: updatedDriver });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
