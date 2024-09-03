import express, { NextFunction, Request, Response } from "express";
import * as service from "../service/breakdown.service";
import * as repository from "./../repository/breakdownRequest.repository";
import { BreakdownRequestInput, BreakdownRequestSchema } from "./../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestSchema } from "./../dto/combinedBreakdownRequest.dto"; // Add this import

const router = express.Router();
const repo = repository; // Adjust if your repo setup is different

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Example authentication middleware
  const isValidUser = true;
  if (!isValidUser) {
    return res.status(403).json({ error: "authorization error" });
  }
  next();
};

router.post(
  "/breakdownrequest",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const result = BreakdownRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      console.log("inside create breakdown request post", req.body);

      // Save to database
      const response = await service.CreateBreakdownRequest(req.body as BreakdownRequestInput);
      console.log(response);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error creating breakdown request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// New route for combined breakdown request
router.post(
  "/combined-breakdown-request",
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = CombinedBreakdownRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      console.log("Processing combined breakdown request", req.body);

      // Call service method to handle combined request
      const response = await service.CreateCombinedBreakdownRequest(result.data);
      console.log(response);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing combined breakdown request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
