import { z } from "zod";
import { BreakdownRequestSchema, BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { BreakdownRequestRepository } from "../repository/breakdownRequest.repository";

export const createBreakdownRequest = async (req: Request, res: Response) => {
  try {
    const data = BreakdownRequestSchema.parse(req.body);
    const breakdownRequestId = await BreakdownRequestRepository.saveBreakdownRequest(data);
    res.status(201).json({ id: breakdownRequestId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      res.status(400).json({ errors: errorMessages });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};