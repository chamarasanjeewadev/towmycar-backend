import express, { NextFunction, Request, Response } from 'express';
import * as service from "../service/breakdownRequest.service";
import * as service2 from "../service/breakdown.service";
import * as repository from "./../repository/breakdownRequest.repository";
import { BreakdownRequestInput, BreakdownRequestSchema } from "./../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestSchema } from '../dto/combinedBreakdownRequest.dto';

const router = express.Router();

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
      const response = await service.CreateBreakdownRequest(req.body as BreakdownRequestInput, repository.BreakdownRequestRepository);
      console.log(response);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error creating breakdown request:", error);
      res.status(500).json({ error: "Internal Server Error" });
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
      const response = await service2.CreateCombinedBreakdownRequest(result.data);
      console.log(response);
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing combined breakdown request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// New route for getting all breakdown requests with user details
router.get(
  "/list",
  async (req: Request, res: Response) => {
    try {
      const breakdownRequests = await service.BreakdownRequestService.getAllBreakdownRequestsWithUserDetails();
      res.status(200).json(breakdownRequests);
    } catch (error) {
      console.error("Error fetching breakdown requests:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
