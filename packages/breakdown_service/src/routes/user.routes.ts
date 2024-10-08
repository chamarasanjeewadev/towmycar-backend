import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/user.service";
import * as repository from "../repository/user.repository";
import { UserRegisterInput } from "../dto/userRequest.dto";
import { UserRepository } from "../repository/user.repository";
import { saveFcmToken } from "../service/user/user.service";
import { fcmTokenSchema, FcmTokenInput } from "../dto/fcmToken.dto";
import bodyParser from "body-parser";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";
import axios from "axios";
import Stripe from "stripe";
import { Driver } from "@breakdownrescue/database";
import { DriverRepository } from "../repository/driver.repository";
import { CustomError, ERROR_CODES } from "./../utils";

const router = express.Router();
const repo = repository.UserRepository;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async function (req: Request, res: Response, next: NextFunction) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error("You need a WEBHOOK_SECRET in your .env");
    }

    const headers = req.headers;
    const payload = req.body;

    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res
        .status(400)
        .json({ message: "Error occurred -- no svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    evt = payload;
    console.log("data....", evt);

    if (evt.type === "user.created") {
      const userData = evt.data;
      try {
        // Replace this line:
        // const userInfo = await repo.createUserFromWebhook(userData);
        // With this:
        const userInfo = await service.createUserFromWebhook(userData, repo);

        // Create Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: userData.email_addresses[0].email_address,
          metadata: { driverId: userInfo.driverId?.toString() },
        });

        // Update driver with Stripe customer ID
        if (userInfo.driverId) {
          await DriverRepository.updateDriver(userInfo.driverId, {
            stripeId: stripeCustomer.id,
          });
        }

        const params = {
          userInfo: {
            ...userInfo,
            stripeCustomerId: stripeCustomer.id,
          },
        };
        // update user in clerk
        const updatedUser = await clerkClient.users.updateUser(
          evt.data.id,
          params
        );

        console.log("updatedUser.....", updatedUser);
        if (userInfo.userId) {
          await clerkClient.users.updateUserMetadata(evt.data.id, {
            privateMetadata: {
              userInfo: {
                ...userInfo,
                stripeCustomerId: stripeCustomer.id,
              },
            },
            publicMetadata: {
              userInfo: {
                ...userInfo,
                stripeCustomerId: stripeCustomer.id,
              },
            },
          });
        }

        res.status(200).json({
          success: true,
          message:
            "User created, processed, and Stripe customer created successfully",
        });
      } catch (error) {
        console.error("Error processing user creation:", error);
        res.status(500).json({
          success: false,
          message: "Error processing user creation",
        });
      }
    } else if (evt.type === "user.updated") {
      const userData = evt.data;
      try {
        // Replace this line:
        // const userInfo = await repo.createUserFromWebhook(userData);
        // With this:
        const userInfo = await service.createUserFromWebhook(userData, repo);
      } catch (error) {
        console.error("Error processing user update:", error);
        res.status(500).json({
          success: false,
          message: "Error processing user update",
        });
      }
    } else {
      res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }
  }
);

router.get(
  "/profile",
  clerkAuthMiddleware("customer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("inside get profile......", req.query);
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

// Add this new route
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
  // clerkAuthMiddleware("customer"),
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

export default router;
