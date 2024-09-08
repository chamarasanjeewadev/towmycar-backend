import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/user.service";
import * as repository from "../repository/user.repository";
import { ValidateRequest } from "../utils/validator";
import { UserRequestInput, UserRequestSchema } from "../dto/userRequest.dto";

const router = express.Router();
const repo = repository.UserRepository;

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // jwt
  const isValidUser = true;
  if (!isValidUser) {
    return res.status(403).json({ error: "authorization error" });
  }

  next();
};

router.post(
  "/user",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("inside create user post", req.body);

      const response = await service.CreateUser(
        req.body as UserRequestInput,
        repo
      );
      return res.status(200).json(response);
    } catch (error) {
      console.log("error from create user", error);
      return res.status(404).json({ error });
    }
  }
);

router.post("/register", async (req, res) => {
  // ... existing code ...
});

router.post("/login", async (req, res) => {
  // ... existing code ...
});

router.get("/profile", async (req, res) => {
  // ... existing code ...
});

// ... other routes ...

export default router;
