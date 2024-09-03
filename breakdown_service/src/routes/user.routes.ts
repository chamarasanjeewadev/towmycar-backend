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

      console.log("inside create user post",req.body);
      // const error = ValidateRequest<UserRequestInput>(
      //   req.body,
      //   UserRequestSchema
      // );
      // console.log("request validated", error);

      // if (error) {
      //   return res.status(404).json({ error });
      // }
      // publish to db
      const response = await service.CreateUser(
        req.body as UserRequestInput,
        repo
      );
      console.log("reponse from create user",response);
      return res.status(200).json(response);
    } catch (error) {
      console.log("error from create user",error);
      return res.status(404).json({ error });
    }
  }
);
export default router;
