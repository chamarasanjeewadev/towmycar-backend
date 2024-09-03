import { z } from "zod";

// Define the schema using Zod for validation
export const BreakdownRequestSchema = z.object({
  // User profile fields
  userId: z.number(), // Change this from string to number
  requestType: z.string(),
  location: z.string(),
  description: z.string(),
});

// Define the TypeScript type for form data
export type BreakdownRequestInput = z.infer<typeof BreakdownRequestSchema>;
