import express, { Request, Response } from "express";
import { contactUsSchema } from "../dto/driver.dto";
import { CustomError } from "@towmycar/common";
import { ERROR_CODES } from "@towmycar/common";
const router = express.Router();

router.post("/contact-admin", async (req: Request, res: Response) => {
  const result = contactUsSchema.partial().safeParse(req.body);
  if (!result.success) {
    throw new CustomError(
      ERROR_CODES.INVALID_INPUT,
      400,
      "Invalid profile data: " + result.error.message,
    );
  }

  const { firstName, lastName, email, message } = result.data;
  // TODO send sns notification
});
export default router;
