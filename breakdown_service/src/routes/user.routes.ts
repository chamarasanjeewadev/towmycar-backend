import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user.service";
import * as repository from "../repository/user.repository";
import { CustomError, ERROR_CODES } from "../utils/errorHandlingSetup";
import { UserRequestInput, UserRequestSchema } from "../dto/userRequest.dto";
import { authenticateJWT } from "../middleware/auth";

const router = express.Router();
const repo = repository.UserRepository;

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, userType } = req.body;
      console.log("req.body......", req.body);

      if (!username || !email || !password) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "First name, last name, email, and password are required"
        );
      }

      if (userType === "user") {
        const newUser = await service.CreateUser(
          { email, username, password },
          repo
        );

        res.status(201).json({
          message: "User registered successfully",
          user: newUser,
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
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

export default router;
