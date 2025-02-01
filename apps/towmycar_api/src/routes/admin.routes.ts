import express, { NextFunction, Request, Response } from "express";
import { contactUsSchema } from "../dto/driver.dto";
import { CustomError } from "@towmycar/common";
import { ERROR_CODES } from "@towmycar/common";
import { ContactUsEmail } from "./../service/admin/admin.service";
const router = express.Router();

router.post(
  "/contact-admin",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = contactUsSchema.partial().safeParse(req.body.message);
      if (!result.success) {
        throw new CustomError(
          ERROR_CODES.INVALID_INPUT,
          400,
          "Invalid profile data: " + result.error.message,
        );
      }

      const { firstName, lastName, email, message } = result.data;
      ContactUsEmail({
        firstName,
        lastName,
        email,
        message,
      });
      res.status(200).json({ message: "Message sent successfully" });

      // TODO send sns notification
    } catch (error) {
      next(error);
    }
  },
);
export default router;
