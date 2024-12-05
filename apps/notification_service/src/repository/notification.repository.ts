import {
  DB,
  and,
  gt,
  eq,
  notifications,
  Notifications,
  desc,
} from "@towmycar/database";

import { DeliveryNotificationType, NotificationType } from "@towmycar/common";

interface NotificationTrackingInput {
  userId: number;
  notificationType: NotificationType;
  deliveryType: DeliveryNotificationType;
  breakdownRequestId: number;
  status?: string;
  retryCount?: number;
  lastAttempt?: Date;
}

interface NotificationInput {
  userId: number;
  title: string;
  message: string;
  url?: string | null;
  notificationType: string;
  deliveryType: DeliveryNotificationType;
  baseNotificationType: DeliveryNotificationType;
  breakdownRequestId?: number | null;
  payload?: string | null;
}

export interface NotificationRepositoryType {
  checkNotificationSent: (
    tracking: NotificationTrackingInput
  ) => Promise<boolean>;

  updateNotificationStatus: (
    breakdownRequestId: string,
    notificationType: NotificationType,
    deliveryType: DeliveryNotificationType,
    status: string,
    retryCount?: number
  ) => Promise<void>;
  getFailedNotifications: (
    deliveryType: DeliveryNotificationType
  ) => Promise<Notifications[]>;
  saveNotification: (notification: NotificationInput) => Promise<Notifications>;
  getNotificationsByUserId: (userId: number) => Promise<Notifications[]>;
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
          eq(notifications.baseNotificationType, tracking.deliveryType),
          eq(notifications.breakdownRequestId, tracking.breakdownRequestId),
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

const updateNotificationStatus = async (
  breakdownRequestId: string,
  notificationType: NotificationType,
  deliveryType: DeliveryNotificationType,
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
  deliveryType: DeliveryNotificationType
): Promise<Notifications[]> => {
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
): Promise<Notifications> => {
  try {
    const [result] = await DB.insert(notifications)
      .values({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        notificationType: notification.notificationType,
        notificationBaseType: "default value",
        deliveryType: notification?.deliveryType?.toString() ?? "default value",
        breakdownRequestId: notification.breakdownRequestId ?? null,
        url: notification.url ?? null,
        payload: notification.payload ?? null,
        status: "PENDING",
        retryCount: 0,
        isSeen: false,
        lastAttempt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as typeof notifications.$inferInsert)
      .returning();
    return result;
  } catch (error) {
    console.error("Error in saveNotification:", error);
    throw error;
  }
};

const getNotificationsByUserId = async (
  userId: number
): Promise<Notifications[]> => {
  try {
    return await DB.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.deliveryType, DeliveryNotificationType.PUSH)
        )
      )
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
  updateNotificationStatus,
  getFailedNotifications,
  saveNotification,
  getNotificationsByUserId,
  markNotificationAsSeen,
};
