import { z } from "zod";

export const DriverSchema = z.object({
  fullName: z.string().min(1, { message: "Please enter your full name" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().min(1, { message: "Please enter your phone number" }),
  vehicleType: z.string().min(1, { message: "Please enter your vehicle type" }),
  vehicleRegistration: z
    .string()
    .min(1, { message: "Please enter a valid vehicle registration" }),
  licenseNumber: z
    .string()
    .min(1, { message: "Please enter your driver's license number" }),
  serviceRadius: z
    .number()
    .min(1, { message: "Please enter a valid service radius" }),
  primaryLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  workingHours: z
    .string()
    .min(1, { message: "Please enter your working hours" }),
  experienceYears: z
    .number()
    .min(0, { message: "Please enter your years of experience" }),
  insuranceDetails: z
    .string()
    .min(1, { message: "Please provide your insurance details" }),
});

export type DriverInput = z.infer<typeof DriverSchema>;
