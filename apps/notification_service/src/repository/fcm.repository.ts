import { DB, fcmTokens, notifications, eq, desc, Notification } from "@towmycar/database";

export type FcmToken = {
  id: number;
  userId: number;
  token: string;
  browserInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

interface NotificationInput {
  userId: number;
  title: string;
  message: string;
  url?: string;
}

export type DriverSearchRepositoryType = {
  getFcmTokensByUserId: (userId: number) => Promise<FcmToken[]>;
  saveNotification: (notification: NotificationInput) => Promise<Notification>;
  getNotificationsByUserId: (userId: number) => Promise<Notification[]>;
  markNotificationAsSeen: (notificationId: number) => Promise<void>;
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

const saveNotification = async (notification: NotificationInput): Promise<Notification> => {
  try {
    const [result] = await DB.insert(notifications)
    //@ts-ignore
      .values({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        url: notification.url,
      })
      .returning();
    return result;
  } catch (error) {
    console.error("Error in saveNotification:", error);
    throw error;
  }
};

const getNotificationsByUserId = async (userId: number): Promise<Notification[]> => {
  try {
    return await DB.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  } catch (error) {
    console.error("Error in getNotificationsByUserId:", error);
    throw error;
  }
};

const markNotificationAsSeen = async (notificationId: number): Promise<void> => {
  try {
    await DB.update(notifications)
    //@ts-ignore
      .set({ isSeen: true })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error in markNotificationAsSeen:", error);
    throw error;
  }
};

export const FcmRepository: DriverSearchRepositoryType = {
  getFcmTokensByUserId,
  saveNotification,
  getNotificationsByUserId,
  markNotificationAsSeen,
};
