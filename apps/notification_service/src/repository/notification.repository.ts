import {
  DB,
  and,
  gt,
  eq,
  notifications,
  Notification,
  desc,
} from "@towmycar/database";

import { BaseNotificationType, NotificationType } from "@towmycar/common";

interface NotificationTrackingInput {
  userId: number;
  notificationType: NotificationType;
  deliveryType: BaseNotificationType;
  breakdownRequestId: string;
  status?: string;
  retryCount?: number;
  lastAttempt?: Date;
}

interface NotificationInput {
  userId: number;
  title: string;
  message: string;
  url?: string;
  notificationType: string;
  baseNotificationType: BaseNotificationType;
  breakdownRequestId?: number;
  payload?: string;
}

export interface NotificationRepositoryType {
  checkNotificationSent: (
    tracking: NotificationTrackingInput
  ) => Promise<boolean>;
  trackNotification: (
    tracking: NotificationTrackingInput
  ) => Promise<Notification>;
  updateNotificationStatus: (
    breakdownRequestId: string,
    notificationType: NotificationType,
    deliveryType: BaseNotificationType,
    status: string,
    retryCount?: number
  ) => Promise<void>;
  getFailedNotifications: (
    deliveryType: BaseNotificationType
  ) => Promise<Notification[]>;
  saveNotification: (notification: NotificationInput) => Promise<Notification>;
  getNotificationsByUserId: (userId: number) => Promise<Notification[]>;
  markNotificationAsSeen: (notificationId: number) => Promise<void>;
}

const checkNotificationSent = async (
  tracking: NotificationTrackingInput
): Promise<boolean> => {
  try {
    const existingNotification = await DB.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, tracking.userId),
          eq(notifications.notificationType, tracking.notificationType),
          eq(
            notifications.breakdownRequestId,
            parseInt(tracking.breakdownRequestId)
          ),
          gt(notifications.createdAt, new Date(Date.now() - 3600000))
        )
      )
      .limit(1);

    return existingNotification.length > 0;
  } catch (error) {
    console.error("Error in checkNotificationSent:", error);
    return false;
  }
};

const trackNotification = async (
  tracking: NotificationTrackingInput
): Promise<Notification> => {
  try {
    const insertData = {
      userId: tracking.userId,
      notificationType: tracking.notificationType,
      breakdownRequestId: parseInt(tracking.breakdownRequestId),
      status: tracking.status || "SENT",
      retryCount: tracking.retryCount || 0,
      lastAttempt: tracking.lastAttempt || new Date(),
    };

    const [result] = await DB.insert(notifications)
      //@ts-ignore
      .values(insertData)
      .returning();
    return result;
  } catch (error) {
    console.error("Error in trackNotification:", error);
    throw error;
  }
};

const updateNotificationStatus = async (
  breakdownRequestId: string,
  notificationType: NotificationType,
  deliveryType: BaseNotificationType,
  status: string,
  retryCount?: number
): Promise<void> => {
  try {
    const updateData = {
      status,
      lastAttempt: new Date(),
      updatedAt: new Date(),
      ...(retryCount !== undefined && { retryCount }),
    };

    await DB.update(notifications)
      //@ts-ignore
      .set(updateData)
      .where(
        and(
          eq(notifications.breakdownRequestId, parseInt(breakdownRequestId)),
          eq(notifications.notificationType, notificationType)
        )
      );
  } catch (error) {
    console.error("Error in updateNotificationStatus:", error);
    throw error;
  }
};

const getFailedNotifications = async (
  deliveryType: BaseNotificationType
): Promise<Notification[]> => {
  try {
    return await DB.select()
      .from(notifications)
      .where(and(eq(notifications.status, "FAILED")));
  } catch (error) {
    console.error("Error in getFailedNotifications:", error);
    throw error;
  }
};

const saveNotification = async (
  notification: NotificationInput
): Promise<Notification> => {
  try {
    const [result] = await DB.insert(notifications)
      //@ts-ignore
      .values({
        userId: notification.userId,
        notificationType: notification.notificationType,
        baseNotificationType: notification.baseNotificationType.toString(),
        payload: notification.payload,
        title: notification.title,
        message: notification.message,
        breakdownRequestId: notification.breakdownRequestId,
        url: notification.url,
      })
      .returning();
    return result;
  } catch (error) {
    console.error("Error in saveNotification:", error);
    throw error;
  }
};

const getNotificationsByUserId = async (
  userId: number
): Promise<Notification[]> => {
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

const markNotificationAsSeen = async (
  notificationId: number
): Promise<void> => {
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

export const NotificationRepository: NotificationRepositoryType = {
  checkNotificationSent,
  trackNotification,
  updateNotificationStatus,
  getFailedNotifications,
  saveNotification,
  getNotificationsByUserId,
  markNotificationAsSeen,
};
