import { DeliveryTimeframe, UserStatus } from "@towmycar/common";
import { z } from "zod";

// Define the schema using Zod for validation
export const BreakdownRequestSchema = z.object({
  customerId: z.number().optional(),
  requestType: z.string(),
  address: z.string(),
  toAddress: z.string(),
  postCode: z.string().nullable().optional(),
  toPostCode: z.string().nullable().optional(),
  make: z.string(),
  makeModel: z.string(),
  regNo: z.string(),
  weight: z.number(),
  deliveryTimeframe: z.nativeEnum(DeliveryTimeframe),
  mobileNumber: z.string(),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  userToLocation: z.object({
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
  toAddress: string;
  postCode: string;
  toPostCode: string;
  deliveryTimeframe: string;
  make: string;
  makeModel: string;
  regNo: string;
  weight: number;
  mobileNumber: string;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  userToLocation: {
    latitude: number;
    longitude: number;
  };
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
  userToLocation: {
    latitude: number;
    longitude: number;
  };
}

export const RequestIdParamSchema = z.object({
  requestId: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive().int()),
});

export const DriverIdParamSchema = z.object({
  driverId: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive().int()),
});

export const AssignmentIdParamSchema = z.object({
  assignmentId: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive().int()),
});

export const RatingSchema = z.object({
  driverRating: z.number().min(1).max(5).nullable(),
  driverFeedback: z.string().nullable(),
  siteRating: z.number().min(1).max(5).nullable(),
  siteFeedback: z.string().nullable(),
});

// Add these new schemas
export const AnonymousBreakdownRequestSchema = z.object({
  body: BreakdownRequestSchema,
});

export const UserStatusSchema = z.object({
  userStatus: z.nativeEnum(UserStatus),
});

export const OptionalRequestIdParamSchema = z.object({
  requestId: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive().int())
    .optional(),
});
