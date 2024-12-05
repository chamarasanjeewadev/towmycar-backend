import { sendPushNotification as sendPush } from "../utils/pushNotificationSender";
import { FcmRepository } from "../repository/fcm.repository";
import {
  PushNotificationPayload,
  NotificationType,
  ListnerPayload,
  DeliveryNotificationType,
} from "@towmycar/common";
import { NotificationRepository } from "../repository/notification.repository";

interface NotificationMessage {
  title: string;
  body: string;
  data?: {
    url?: string;
  };
}

export interface PushNotificationResult {
  success: boolean;
  notificationId?: number;
  error?: string;
  sentTo: string[];
  failedTokens: string[];
}

async function sendGenericPushNotification(
  notificationType: NotificationType,
  payload: PushNotificationPayload
): Promise<PushNotificationResult> {
  const { userId, title, message, url } = payload;

  if (!userId) {
    return {
      success: false,
      error: "User ID is missing in the payload",
      sentTo: [],
      failedTokens: [],
    };
  }

  try {
    const notification = await NotificationRepository.saveNotification({
      userId,
      title,
      message,
      deliveryType: DeliveryNotificationType.PUSH,
      baseNotificationType: DeliveryNotificationType.PUSH,
      notificationType: notificationType.toString(),
      payload: JSON.stringify(payload),
      url,
    });

    const tokens = await FcmRepository.getFcmTokensByUserId(userId);

    if (tokens.length === 0) {
      return {
        success: false,
        notificationId: notification.id,
        error: `No active FCM tokens found for user ${userId}`,
        sentTo: [],
        failedTokens: [],
      };
    }

    const uniqueTokens = Array.from(new Set(tokens.map(t => t.token)));

    const notificationMessage: NotificationMessage = {
      title,
      body: message,
      data: url ? { url } : undefined,
    };

    const notificationPromises = uniqueTokens.map(token =>
      sendPush(token, notificationMessage)
    );

    const results = await Promise.allSettled(notificationPromises);

    const successfulTokens = results
      .map((result, index) =>
        result.status === "fulfilled" ? uniqueTokens[index] : null
      )
      .filter((token): token is string => token !== null);

    const failedTokens = results
      .map((result, index) =>
        result.status === "rejected" ? uniqueTokens[index] : null
      )
      .filter((token): token is string => token !== null);

    return {
      success: successfulTokens.length > 0,
      notificationId: notification.id,
      sentTo: successfulTokens,
      failedTokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      sentTo: [],
      failedTokens: [],
    };
  }
}

export function generatePushNotificationPayload(
  type: NotificationType,
  payload: ListnerPayload
): PushNotificationPayload {
  switch (type) {
    case NotificationType.DRIVER_ASSIGNED:
      return {
        userId: payload.sendToId,
        title: "Driver Assigned",
        message: "A driver has been assigned to your request",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_REGISTERED:
      return {
        userId: payload?.driver?.userId,
        title: "Registration Complete",
        message: "Your driver registration has been received",
        url: payload?.viewRequestLink,
      };

    case NotificationType.USER_REQUEST:
      return {
        userId: payload.sendToId,
        title: "New Request",
        message: "Your breakdown assistance request has been received",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTATION_UPDATED:
      return {
        userId: payload?.driver?.userId,
        title: "Quotation Updated",
        message: "A driver has updated their quotation for your request",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTED:
      return {
        userId: payload.sendToId,
        title: "New Quote Available",
        message: "A new quote is available for your breakdown request",
        url: payload?.viewRequestLink,
      };

    case NotificationType.USER_ACCEPT:
    case NotificationType.DRIVER_ACCEPT:
      return {
        userId: payload?.sendToId,
        title: "Request Accepted",
        message: "Your request has been accepted",
        url: payload?.viewRequestLink,
      };

    case NotificationType.USER_REJECT:
    case NotificationType.DRIVER_REJECT:
      return {
        userId: payload.sendToId,
        title: "Request Status Update",
        message: "There has been an update to your request",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_NOTIFICATION:
      return {
        userId: payload?.driver?.userId,
        title: "New Breakdown Request",
        message: "A new breakdown request is available in your area",
        url: payload?.viewRequestLink,
      };

    case NotificationType.RATING_REVIEW:
      return {
        userId: payload.sendToId,
        title: "New Rating & Review",
        message: "You have received a new rating and review",
        url: payload?.viewRequestLink,
      };

    default:
      return {
        userId: payload.sendToId,
        title: "Notification",
        message: "You have a new notification",
        url: payload?.viewRequestLink,
      };
  }
}

async function sendPushNotification(
  type: NotificationType,
  pushPayload: PushNotificationPayload
): Promise<PushNotificationResult> {
  return sendGenericPushNotification(type, pushPayload);
}

export const UserNotificationService = {
  sendPushNotification,
  generatePushNotificationPayload,
};
