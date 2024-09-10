import { z } from "zod";

const requiredDriverSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const driverProfileSchema = z.object({
  fullName: z.string().min(1, { message: "Please enter your full name" }),
  phoneNumber: z.string().min(1, { message: "Please enter your phone number" }),
  vehicleType: z.string().min(1, { message: "Please enter your vehicle type" }),
  vehicleRegistration: z
    .string()
    .min(1, { message: "Please enter a valid vehicle registration" }),
  licenseNumber: z
    .string()
    .min(1, { message: "Enter your driver's license number" }),
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
    .min(0, { message: "Enter your years of experience" }),
  insuranceDetails: z
    .string()
    .min(1, { message: "Provide your insurance details" }),
});

export const DriverSchema = requiredDriverSchema.extend({
  profile: driverProfileSchema.partial(),
});

export type DriverInput = z.infer<typeof DriverSchema>;

export type DriverProfileDtoType = z.infer<typeof driverProfileSchema>;
