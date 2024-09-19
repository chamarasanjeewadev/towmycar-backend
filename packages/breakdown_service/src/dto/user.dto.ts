import { z } from "zod";

export const requiredUserSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  userType: z.enum(["user", "driver"]),
});

export const userProfileSchema = z.object({
  fullName: z.string().min(1, { message: "Please enter your full name" }),
  phoneNumber: z.string().min(1, { message: "Please enter your phone number" }),
  // Add any other user-specific fields here
});

export const UserSchema = requiredUserSchema.extend({
  profile: userProfileSchema.partial(),
  userType: z.enum(["user", "driver"]),
});

export const userProfileResponseSchema = userProfileSchema.extend({
  id: z.number(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserInput = z.infer<typeof UserSchema>;
export type UserProfileDtoType = z.infer<typeof userProfileSchema>;
export type requiredUserSchemaType = z.infer<typeof requiredUserSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
