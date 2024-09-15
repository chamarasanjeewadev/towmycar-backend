import { z } from "zod";

export const fcmTokenSchema = z.object({
  userId: z.number().int().positive(),
  token: z.string().min(1, "FCM token is required"),
  browserInfo: z.string().optional(),
});

export type FcmTokenInput = z.infer<typeof fcmTokenSchema>;