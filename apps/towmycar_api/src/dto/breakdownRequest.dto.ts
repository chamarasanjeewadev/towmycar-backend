import { z } from "zod";

// Define the schema using Zod for validation
export const BreakdownRequestSchema = z.object({
  customerId: z.number().optional(),
  requestType: z.string(),
  address: z.string(),
  regNo: z.string(),
  weight: z.number(),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string(),
  color: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

// Define the TypeScript type for form data
export interface BreakdownRequestInput {
  customerId?: number;
  requestType: string;
  address: string;
  toAddress:string;
  make:string;
  makeModel:string;
  regNo: string;
  weight: number;
  mobileNumber: string;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  userToLocation:{
    latitude: number;
    longitude: number;
  }
  description: string;
  color: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface BreakdownRequestWithUserDetails {
  id: number;
  requestType: string;
  location: string;
  description: string | null;
  status: string;
  regNo: string | null;
  weight: number | null;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  userEmail: string | null;
  color: string | null;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  userToLocation:{
    latitude: number;
    longitude: number;
  }
}
