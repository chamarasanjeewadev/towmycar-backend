import express, { Request, Response, NextFunction } from "express";
import {
  getDriverById,
  getDriverProfile,
  updateDriverProfile,
} from "../service/driver/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { DriverService } from "../service/driver/driver.service";
import {
  adminApprovalSchema,
  driverBasicProfileSchema,
  DriverProfileDtoType,
  driverProfileSchema,
  driverSettingsSchema,
} from "../dto/driver.dto";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import axios from "axios";
import { CustomError, ERROR_CODES, UploadDocumentType } from "@towmycar/common";
import { DriverStatus } from "@towmycar/common";
import { getPresignedUrls } from "../utils";
import { Driver } from "@towmycar/database";

const router = express.Router();
const driverService = new DriverService();

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
          "Invalid driver ID",
        );
      }

      const assignments =
        await driverService.getDriverRequestsWithInfo(driverId);
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  },
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
          "Invalid driver ID or request ID",
        );
      }

      const assignment = await driverService.getDriverRequestWithInfo(
        driverId,
        requestId,
      );
      if (!assignment) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "Driver request not found",
        );
      }
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  },
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
          "driverId and status are required",
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
          'Status must be "ACCEPTED", "REJECTED", "QUOTED", or "CLOSED"',
        );
      }

      let parsedEstimation: number | undefined;
      if (estimation !== undefined) {
        parsedEstimation = Number(estimation);
        if (isNaN(parsedEstimation)) {
          throw new CustomError(
            ERROR_CODES.INVALID_INPUT,
            400,
            "Estimation must be a valid number",
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

      const updated = await driverService.updateBreakdownAssignment(
        Number(driverId),
        Number(requestId),
        dataToUpdate,
      );

      if (!updated) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "Driver request not found",
        );
      }
      // }

      res.json({
        message: `Driver request status updated to ${driverStatus}`,
      });
    } catch (error) {
      next(error);
    }
  },
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
          "Driver profile not found",
        );
      }

      res.json(driverProfile);
    } catch (error) {
      next(error);
    }
  },
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
          "Invalid driver ID",
        );
      }

      const result = driverBasicProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid profile data: " + result.error.message,
        );
      }

      const updatedDriver = await updateDriverProfile(
        driverId,
        result.data,
        DriverRepository,
      );

      res.json({
        message: "Driver profile updated successfully",
        driver: updatedDriver,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/profile-settings",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId;
      if (isNaN(driverId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid driver ID",
        );
      }

      const result = driverSettingsSchema.partial().safeParse(req.body);
      if (!result.success) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid profile data: " + result.error.message,
        );
      }

      const updatedDriver = await updateDriverProfile(
        driverId,
        result.data,
        DriverRepository,
      );

      res.json({
        message: "Driver profile updated successfully",
        driver: updatedDriver,
      });
    } catch (error) {
      next(error);
    }
  },
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
          "Registration number is required",
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
              "Error verifying vehicle registration",
          ),
        );
      } else {
        next(error);
      }
    }
  },
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
          "Invalid request ID",
        );
      }

      await driverService.closeBreakdownRequestAndUpdateRating({
        driverId,
        requestId,
        markAsCompleted,
        reason,
      });

      res
        .status(200)
        .json({ message: "Breakdown request closed successfully" });
    } catch (error) {
      next(error);
    }
  },
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
  },
);

router.get(
  "/get-presigned-url",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;
      const documentType = req.query?.documentType as UploadDocumentType;

      const presignedUrls = await getPresignedUrls(userId, [documentType]);
      res.json(presignedUrls?.[0]);
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  "/upload-document",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;
      const { documentType } = req.body;
      await driverService.uploadDocument(
        userId,
        documentType as UploadDocumentType,
      );
      res.json({ message: "Document uploaded successfully" });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/documents",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;
      const documents = await driverService.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/driver-dashboard",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = req.userInfo.driverId;
      const driverProfile = await getDriverProfile(driverId);
      res.json(driverProfile);
    } catch (error) {
      next(error);
    }
  },
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
          "Invalid notification ID",
        );
      }
      await driverService.markNotificationAsSeen(notificationId);
      res.json({ message: "Notification marked as seen" });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/admin-approval",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // send email to admin
      const { driverId } = req.userInfo;
      const validatedData = adminApprovalSchema.safeParse({
        body: req.body,
      });

      // if (!validatedData.success) {
      //   throw new CustomError(
      //     ERROR_CODES.INVALID_INPUT,
      //     400,
      //     "Invalid admin approval data: " + validatedData.error.message,
      //   );
      // }

      const response = await driverService.adminApproval(
        driverId,
        req.body as Partial<DriverProfileDtoType>,
      );

      return res.status(200).json(response?.updatedAt);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
