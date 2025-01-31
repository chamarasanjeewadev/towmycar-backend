import express, { Request, Response, NextFunction } from "express";
import {} from "../service/driver/driver.service";
import { DriverRepository } from "../repository/driver.repository";
import { DriverService } from "../service/driver/driver.service";
import * as userService from "../service/user/user.service";
import {
  adminApprovalSchema,
  driverBasicProfileSchema,
  DriverProfileDtoType,
  driverSettingsSchema,
} from "../dto/driver.dto";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import axios from "axios";
import {
  APIError,
  CustomError,
  ERROR_CODES,
  getExtension,
  UploadDocumentType,
  ValidationError,
} from "@towmycar/common";
import { DriverStatus } from "@towmycar/common";
import {
  generateCloudFrontFilePath,
  getCloudFrontPresignedUrl,
  getPresignedUrls,
} from "../utils";
import { UserRepository } from "../repository/user.repository";
import { Upload } from "aws-sdk/clients/devicefarm";
import { UploadDocumentsResponse } from "aws-sdk/clients/cloudsearchdomain";

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
      let { driverStatus, estimation, explanation,vehicleNo } = req.body;

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
        ...(vehicleNo && { vehicleNo }),
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

      const driverProfile = await driverService.getDriverById(userId);
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

      const updatedDriver = await driverService.updateDriverProfile(
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

      const updatedDriver = await driverService.updateDriverProfile(
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
      const docType=req.query?.docType as string;
     const extention= getExtension(docType);

      const presignedUrls = await getPresignedUrls(userId, [documentType],extention);
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
      const { documentType,docType } = req.body;
      await driverService.uploadDocument(
        userId,
        documentType as UploadDocumentType,docType
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
      const driverProfile =
        await driverService.getDriverDashboardStatsProfile(driverId);
      res.json(driverProfile);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/notifications/chat/all/isSeen",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.markAllChatNotificationsAsSeen(
      req.userInfo.userId,
      UserRepository,
    );
    res.json({ message: "All chat notifications marked as seen" });
  },
);

router.patch(
  "/notifications/other/all/isSeen",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.markAllNotificationsAsSeen(
      req.userInfo.userId,
      UserRepository,
    );
    res.json({ message: "All other notifications marked as seen" });
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
      await userService.markNotificationAsSeen(notificationId, UserRepository);
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

      const response = await driverService.requestAdminApproval(
        driverId,
        req.body as Partial<DriverProfileDtoType>,
      );

      return res.status(200).json(response?.updatedAt);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/signed-url", clerkAuthMiddleware("driver"), async (req, res) => {
  try {
    const { documentType } = req.query;
    const { userId } = req.userInfo;
    if (!documentType) {
      throw new ValidationError("Document type is required");
    }

    const signedUrl =await driverService.getCloudfrontPresignedUrl(userId,documentType as UploadDocumentType) ;

    res.json({ signedUrl });
  } catch (error) {
    throw new APIError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while getting presigned url",
    );
  }
});

export default router;
