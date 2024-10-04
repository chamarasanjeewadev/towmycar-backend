import { z } from "zod";

export const CombinedBreakdownRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  postcode: z.string(),
  regNo: z.string(),
  weight: z.number(),
  mobileNumber: z.string(),
  requestType: z.string(),
  address: z.string(),
  userLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string(),
});

export type CombinedBreakdownRequestInput = z.infer<
  typeof CombinedBreakdownRequestSchema
>;
