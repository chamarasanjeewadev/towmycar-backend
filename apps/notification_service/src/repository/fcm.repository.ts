//@ts-nocheck
import {
  DB,
  breakdownRequest,
  BreakdownRequest,
  serviceRatings,
  breakdownAssignment,
  customer,
  user,
  driver,
  Driver,
  BreakdownAssignment,
  User,
  fcmTokens,
} from "@towmycar/database";
import { eq } from "drizzle-orm";

export type FcmToken = {
  id: number;
  userId: number;
  token: string;
  browserInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export type DriverSearchRepositoryType = {
  getFcmTokensByUserId: (userId: number) => Promise<FcmToken[]>;
};

const getFcmTokensByUserId = async (userId: number): Promise<FcmToken[]> => {
  try {
    const tokens = await DB.select()
      .from(fcmTokens)
      .where(eq(fcmTokens.userId, userId));
    // .where(eq(fcmTokens.isActive, true));
    console.log("fcm tokens", tokens);
    return tokens as FcmToken[];
  } catch (error) {
    console.error("Error in getFcmTokensByUserId:", error);
    throw error;
  }
};

export const DriverSearchRepository: DriverSearchRepositoryType = {
  getFcmTokensByUserId,
};
