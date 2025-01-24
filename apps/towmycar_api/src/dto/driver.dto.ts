import {
  DriverApprovalStatus,
  DriverAvailabilityStatus,
} from "@towmycar/common";
import { z } from "zod";

const requiredDriverSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const adminApprovalSchema = z.object({
  agreedTerms: z.string().refine(val => val === "true", {
    message: "You must agree to the terms and conditions",
  }),
});

export const contactUsSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' })
})


export const driverBasicProfileSchema = z.object({
  firstName: z.string().min(1, { message: "Please enter your first name" }),
  lastName: z.string().min(1, { message: "Please enter your last name" }),
  phoneNumber: z.string().min(1, { message: "Please enter your phone number" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  organizationName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  address1: z.string().min(1, { message: "Please enter your address 1" }),
  address2: z.string().optional().nullable(),
  city: z.string().min(1, { message: "Please enter your city" }),
  state: z.string().min(1, { message: "Please enter your state" }),
  postcode: z.string().min(1, { message: "Please enter your postal code" }),
  country: z.string().min(1, { message: "Please enter your country" }),
  profileDescription: z.string().optional().nullable(),
  agreedTerms: z.boolean().default(false),
});

export const driverSettingsSchema = z.object({
  serviceRadius: z
    .number()
    .min(1, { message: "Please enter a valid service radius greater than 0" }),
  maxWeight: z.number().min(0).max(5000),
  primaryLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  availabilityStatus: z
    .nativeEnum(DriverAvailabilityStatus)
    .default(DriverAvailabilityStatus.UNAVAILABLE),
  address: z.string().optional().nullable(),
});

export const driverProfileSchema = z.object({
  firstName: z.string().min(1, { message: "Please enter your first name" }),
  lastName: z.string().min(1, { message: "Please enter your last name" }),
  phoneNumber: z.string().min(1, { message: "Please enter your phone number" }),
  vehicleType: z.string().min(1, { message: "Please enter your vehicle type" }),
  maxWeight: z.number().min(1, { message: "Please enter your max weight" }),
  agreedTerms: z.boolean().default(false),
  availabilityStatus: z
    .nativeEnum(DriverAvailabilityStatus)
    .default(DriverAvailabilityStatus.UNAVAILABLE),
  approvalStatus: z
    .nativeEnum(DriverApprovalStatus)
    .default(DriverApprovalStatus.PENDING),
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
  profileDescription: z.string().optional().nullable(),
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

export const driverProfileResponseSchema = driverProfileSchema.extend({
  id: z.number(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DriverProfileResponse = z.infer<typeof driverProfileResponseSchema>;
