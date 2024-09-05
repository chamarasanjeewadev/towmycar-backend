import { z } from "zod";

// Define the schema using Zod for validation
export const BreakdownRequestSchema = z.object({
  // User profile fields
  userId: z.number(), // Change this from string to number
  requestType: z.string(),
  location: z.string(),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string(),
});

// Define the TypeScript type for form data
export type BreakdownRequestInput = z.infer<typeof BreakdownRequestSchema>;

export interface BreakdownRequestWithUserDetails {
  id: number;
  requestType: string;
  location: string;
  description: string | null;
  status: string;
  userId: number;
  userName: string;
  userEmail: string;
  // Add more user fields as needed
}
