import { z } from "zod";

// Define the schema using Zod for validation
export const BreakdownRequestSchema = z.object({
  // User profile fields
  userId: z.number(), // Change this from string to number
  requestType: z.string(),
  address: z.string(),
  regNo: z.string(),
  weight: z.number(),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string(),
});

// Define the TypeScript type for form data
export type BreakdownRequestInput = {
  customerId: number;
  requestType: string;
  regNo: string;
  weight: number;
  address: string;
  userLocation: {
    longitude: number;
    latitude: number;
  };
  description?: string | null;
};

export interface BreakdownRequestWithUserDetails {
  id: number;
  requestType: string;
  location: string;
  description: string | null;
  status: string;
  userId: number;
  userName: string;
  userEmail: string | null;
  // Add more user fields as needed
}
