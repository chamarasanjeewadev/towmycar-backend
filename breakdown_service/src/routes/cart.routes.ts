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
  "/cart",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("inside carts post");
      const error = ValidateRequest<UserRequestInput>(
        req.body,
        UserRequestSchema
      );
      console.log("request validated", error);

      if (error) {
        return res.status(404).json({ error });
      }

      const response = await service.CreateUser(
        req.body as UserRequestInput,
        repo
      );
      console.log(response);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(404).json({ error });
    }
  }
);


export default router;
