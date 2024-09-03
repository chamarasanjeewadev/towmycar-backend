import { z } from "zod";

// Define the schema using Zod for validation
export const BreakdownRequestSchema = z.object({
  // User profile fields
  userId: z.string().min(1, { message: "User ID is required." }),
  requestType: z.string().min(1, { message: "Request type is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  description: z.string().optional(),
});

// Define the TypeScript type for form data
export type BreakdownRequestInput = z.infer<typeof BreakdownRequestSchema>;
