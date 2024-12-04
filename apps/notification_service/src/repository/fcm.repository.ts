import { DB, fcmTokens, eq } from "@towmycar/database";

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
    console.log("fcm tokens", tokens);
    return tokens as FcmToken[];
  } catch (error) {
    console.error("Error in getFcmTokensByUserId:", error);
    throw error;
  }
};

export const FcmRepository: DriverSearchRepositoryType = {
  getFcmTokensByUserId,
};
