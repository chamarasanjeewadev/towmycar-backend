import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/user.service";
import * as repository from "../repository/user.repository";
import { UserRegisterInput } from "../dto/userRequest.dto";
import { UserRepository } from "../repository/user.repository";
import { saveFcmToken } from "../service/user/user.service";
import { FcmTokenInput } from "../dto/fcmToken.dto";
import bodyParser from "body-parser";
import { clerkClient } from "@clerk/clerk-sdk-node";
import axios from "axios";
import Stripe from "stripe";
import { Driver } from "@towmycar/database";
import { DriverRepository } from "../repository/driver.repository";
import { CustomError, ERROR_CODES } from "@towmycar/common";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";

const router = express.Router();
const repo = repository.UserRepository;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { headers, body: payload } = req;
      validateWebhookSecret();
      logWebhookHeaders(headers);
      validateSvixHeaders(headers);

      const evt = payload;
      console.log("data....", evt);

      switch (evt.type) {
        case "user.created":
          return handleUserCreated(evt, res);
        case "user.updated":
          return handleUserUpdated(evt, res);
        default:
          return handleOtherEvents(evt, res);
      }
    } catch (error) {
      handleWebhookError(error, res);
    }
  }
);

function validateWebhookSecret() {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Server configuration error: WEBHOOK_SECRET is missing");
  }
}

function logWebhookHeaders(headers: any) {
  console.log("All headers:", JSON.stringify(headers, null, 2));
  console.log("svix-id:", headers["svix-id"]);
  console.log("svix-timestamp:", headers["svix-timestamp"]);
  console.log("svix-signature:", headers["svix-signature"]);
}

function validateSvixHeaders(headers: any) {
  const svixId = headers["svix-id"];
  const svixTimestamp = headers["svix-timestamp"];
  const svixSignature = headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Error occurred -- missing svix headers");
  }
}

async function handleUserCreated(evt: any, res: Response) {
  try {
    const userData = evt.data;
    const userInfo = await service.createUserFromWebhook(userData, repo);
    const stripeCustomerId = await createStripeCustomerIfDriver(
      userInfo,
      userData
    );
    await updateClerkUser(evt.data.id, userInfo, stripeCustomerId);

    return res.status(200).json({
      success: true,
      message:
        "User created, processed, and Stripe customer created successfully",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing webhook",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function createStripeCustomerIfDriver(userInfo: any, userData: any) {
  if (userInfo?.driverId) {
    const stripeCustomer = await stripe.customers.create({
      email: userData.email_addresses[0].email_address,
      metadata: { driverId: userInfo.driverId?.toString() },
    });
    await DriverRepository.updateDriver(userInfo.driverId, {
      stripeId: stripeCustomer.id,
    });
    return stripeCustomer.id;
  }
  return undefined;
}

async function updateClerkUser(
  clerkUserId: string,
  userInfo: any,
  stripeCustomerId: string | undefined
) {
  try {
    const params = {
      userInfo: {
        ...userInfo,
        ...(stripeCustomerId && { stripeCustomerId }),
      },
    };

    const updatedUser = await clerkClient.users.updateUser(clerkUserId, params);
    console.log("updatedUser.....", updatedUser);

    if (userInfo?.userId) {
      await clerkClient.users.updateUserMetadata(clerkUserId, {
        privateMetadata: {
          userInfo: {
            ...userInfo,
            ...(stripeCustomerId && { stripeCustomerId }),
          },
        },
        publicMetadata: {
          userInfo: {
            ...userInfo,
            ...(stripeCustomerId && { stripeCustomerId }),
          },
        },
      });
    }
  } catch (error) {
    console.error("Error updating user metadata:", error);
    throw error;
  }
}

async function handleUserUpdated(evt: any, res: Response) {
  const userData = evt.data;
  await service.createUserFromWebhook(userData, repo);
  return res.status(200).json({
    success: true,
    message: "User updated successfully",
  });
}

function handleOtherEvents(evt: any, res: Response) {
  return res.status(200).json({
    success: true,
    message: "Webhook received and acknowledged",
    eventType: evt.type,
  });
}

function handleWebhookError(error: any, res: Response) {
  console.error("Error processing webhook:", error);
  return res.status(500).json({
    success: false,
    message: "Error processing webhook",
    error: error instanceof Error ? error.message : String(error),
  });
}

router.get(
  "/profile",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;
      const userProfile = await service.getUserProfileById(userId, repo);
      if (!userProfile) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "User profile not found"
        );
      }

      res.json(userProfile);
    } catch (error) {
      next(error);
    }
  }
);


// router.get(
//   "/profile/:id",
//   clerkAuthMiddleware("customer"),
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const id = parseInt(req.params.id, 10);
//       if (isNaN(id)) {
//         throw new CustomError(
//           ERROR_CODES.INVALID_INPUT,
//           400,
//           "Invalid user ID"
//         );
//       }

//       const userProfile = await service.getUserProfileById(id, repo);
//       if (!userProfile) {
//         throw new CustomError(
//           ERROR_CODES.RESOURCE_NOT_FOUND,
//           404,
//           "User profile not found"
//         );
//       }

//       res.json(userProfile);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// Add this new route
router.patch(
  "/profile",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.userInfo.userId;
      if (isNaN(id)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid user ID"
        );
      }

      const updateData: Partial<UserRegisterInput> = req.body;

      // You might want to add validation for updateData here

      const updatedProfile = await service.updateUserProfile(
        id,
        updateData,
        repo
      );
      if (!updatedProfile) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "User profile not found"
        );
      }

      res.json({
        message: "User profile updated successfully",
        user: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);
//@ts-ignore
router.post(
  "/fcm-token",
  // validateRequest(fcmTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, browserInfo, userId } = req.body as FcmTokenInput;
      console.log("req.body.........", req.body);
      const result = await saveFcmToken(
        userId,
        token,
        browserInfo,
        UserRepository
      );
      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving FCM token:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Add this new route for getting driver profile

router.post(
  "/verify-vehicle-registration",
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

      // Extract the required fields with optional chaining
      const filteredData = {
        weight: response.data?.Dimensions?.KerbWeight ?? null,
        Make: response.data?.VehicleRegistration?.Make ?? null,
        MakeModel: response.data?.VehicleRegistration?.MakeModel ?? null,
        color: response.data?.VehicleRegistration?.Colour ?? null,
      };

      // Check if any of the required fields are null
      if (Object.values(filteredData).some(value => value === null)) {
        throw new CustomError(
          ERROR_CODES.INVALID_RESPONSE,
          400,
          "Incomplete vehicle data received from the API"
        );
      }

      res.json(filteredData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        next(
          new CustomError(
            ERROR_CODES.EXTERNAL_API_ERROR,
            error.response?.status || 500,
            error.response?.data?.message ||
              "Error verifying vehicle registration"
          )
        );
      } else if (error instanceof CustomError) {
        next(error);
      } else {
        next(
          new CustomError(
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            500,
            "An unexpected error occurred"
          )
        );
      }
    }
  }
);

router.patch(
  "/driver/:driverId",
  clerkAuthMiddleware("driver"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const driverId = parseInt(req.params.driverId, 10);
      if (isNaN(driverId)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid driver ID"
        );
      }

      const updateData: Partial<Driver> = req.body;

      // You might want to add validation for updateData here

      const updatedDriver = await DriverRepository.updateDriver(
        driverId,
        updateData
      );
      if (!updatedDriver) {
        throw new CustomError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          404,
          "Driver not found"
        );
      }

      res.json({
        message: "Driver information updated successfully",
        driver: updatedDriver,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add this new route
router.get(
  "/notifications",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userInfo.userId;
      const notifications = await service.getUserNotifications(userId, repo);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }
);

// Add this new route for marking notifications as seen
router.patch(
  "/notifications/:notificationId/isSeen",
  clerkAuthMiddleware("customer"),
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
      await service.markNotificationAsSeen(notificationId, repo);
      res.json({ message: "Notification marked as seen" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
