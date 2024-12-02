import {
  DB,
  and,
  gt,
  eq,
  notificationHistory,
  NotificationHistory,
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

export interface NotificationRepositoryType {
  checkNotificationSent: (
    tracking: NotificationTrackingInput
  ) => Promise<boolean>;
  trackNotification: (
    tracking: NotificationTrackingInput
  ) => Promise<NotificationHistory>;
  updateNotificationStatus: (
    breakdownRequestId: string,
    notificationType: NotificationType,
    deliveryType: BaseNotificationType,
    status: string,
    retryCount?: number
  ) => Promise<void>;
  getFailedNotifications: (
    deliveryType: BaseNotificationType
  ) => Promise<NotificationHistory[]>;
}

const checkNotificationSent = async (
  tracking: NotificationTrackingInput
): Promise<boolean> => {
  try {
    const existingNotification = await DB.select()
      .from(notificationHistory)
      .where(
        and(
          eq(notificationHistory.userId, tracking.userId),
          eq(notificationHistory.notificationType, tracking.notificationType),
          eq(notificationHistory.deliveryType, tracking.deliveryType),
          eq(
            notificationHistory.breakdownRequestId,
            parseInt(tracking.breakdownRequestId)
          ),
          gt(notificationHistory.createdAt, new Date(Date.now() - 3600000))
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
): Promise<NotificationHistory> => {
  try {
    const insertData = {
      userId: tracking.userId,
      notificationType: tracking.notificationType,
      deliveryType: tracking.deliveryType,
      breakdownRequestId: parseInt(tracking.breakdownRequestId),
      status: tracking.status || "SENT",
      retryCount: tracking.retryCount || 0,
      lastAttempt: tracking.lastAttempt || new Date(),
    };

    const [result] = await DB.insert(notificationHistory)
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

    await DB.update(notificationHistory)
    //@ts-ignore
      .set(updateData)
      .where(
        and(
          eq(
            notificationHistory.breakdownRequestId,
            parseInt(breakdownRequestId)
          ),
          eq(notificationHistory.notificationType, notificationType),
          eq(notificationHistory.deliveryType, deliveryType)
        )
      );
  } catch (error) {
    console.error("Error in updateNotificationStatus:", error);
    throw error;
  }
};

const getFailedNotifications = async (
  deliveryType: BaseNotificationType
): Promise<NotificationHistory[]> => {
  try {
    return await DB.select()
      .from(notificationHistory)
      .where(
        and(
          eq(notificationHistory.status, "FAILED"),
          eq(notificationHistory.deliveryType, deliveryType)
        )
      );
  } catch (error) {
    console.error("Error in getFailedNotifications:", error);
    throw error;
  }
};

export const NotificationRepository: NotificationRepositoryType = {
  checkNotificationSent,
  trackNotification,
  updateNotificationStatus,
  getFailedNotifications,
};
