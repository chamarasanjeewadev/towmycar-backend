import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user/user.service";
import * as repository from "../repository/user.repository";
import { CustomError, ERROR_CODES } from "../utils/errorHandlingSetup";
import { requiredUserSchema, UserInput } from "../dto/user.dto";
import { authenticateJWT } from "../middleware/auth";
import { UserRegisterInput } from "../dto/userRequest.dto";
import { z } from "zod";
import { UserRepository } from "../repository/user.repository";
import { saveFcmToken } from "../service/user/user.service";
import { validateRequest } from "./../middleware/requestValidator";
import { fcmTokenSchema, FcmTokenInput } from "../dto/fcmToken.dto";

const router = express.Router();
const repo = repository.UserRepository;
router.use(authenticateJWT(["user"]));
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = requiredUserSchema.safeParse(req.body);
      console.log("result...", result);
      // TODO: do this in middlware
      if (!result.success) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          result.error.issues.map(issue => issue.message).join(", ")
        );
      }

      const { username, email, password, userType } = result.data;

      if (userType === "user") {
        const newUser = await service.CreateUser(
          { email, username, password },
          repo
        );

        res.status(201).json({
          message: "User registered successfully",
          user: newUser?.id,
        });
      } else {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          401,
          "Invalid user type for user registration"
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// ... other existing routes ...

router.get(
  "/profile",
  authenticateJWT(["user"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("inside get profile......", req.query);
      const email = req.query.email as string;
      if (!email) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Email is required"
        );
      }

      const userProfile = await service.getUserProfileByEmail(email, repo);
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
router.get(
  "/profile/:id",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid user ID"
        );
      }

      const userProfile = await service.getUserProfileById(id, repo);
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
router.patch(
  "/profile/:id",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
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

router.post("/fcm-token", validateRequest(fcmTokenSchema), async (req, res) => {
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
});

export default router;
