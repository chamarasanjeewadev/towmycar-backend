import { sendPushNotification as sendPush } from "../utils/pushNotificationSender";
import { FcmRepository } from "../repository/fcm.repository";
import {
  NotificationPayload,
  PushNotificationPayload,
  NotificationType,
  BaseNotificationType,
} from "@towmycar/common";
import { NotificationRepository } from "../repository/notification.repository";

interface NotificationMessage {
  title: string;
  body: string;
  data?: {
    url?: string;
  };
}

async function sendGenericPushNotification(
  notificationType: NotificationType,
  payload: PushNotificationPayload
): Promise<void> {
  const { userId, title, message, url } = payload;

  if (!userId) {
    console.error("User ID is missing in the payload");
    return;
  }

  try {
    await NotificationRepository.saveNotification({
      userId,
      title,
      message,
      baseNotificationType: BaseNotificationType.PUSH,
      notificationType: notificationType.toString(),
      payload: JSON.stringify(payload),
      url,
    });

    const tokens = await FcmRepository.getFcmTokensByUserId(userId);

    if (tokens.length === 0) {
      console.log(`No active FCM tokens found for user ${userId}`);
      return;
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

    const result = await Promise.allSettled(notificationPromises);
    console.log("Push notification results:", result);
    console.log(
      `Push notifications sent to ${uniqueTokens.length} unique devices for user ${userId}`
    );
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
}

async function sendPushNotification(
  type: NotificationType,
  payload: NotificationPayload
): Promise<void> {
  switch (type) {
    case NotificationType.DRIVER_ASSIGNED:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "Driver Assigned",
        message: "A driver has been assigned to your request",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.DRIVER_REGISTERED:
      await sendGenericPushNotification(type, {
        userId: payload?.driver?.userId,
        title: "Registration Complete",
        message: "Your driver registration has been received",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.USER_REQUEST:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "New Request",
        message: "Your breakdown assistance request has been received",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.DRIVER_QUOTATION_UPDATED:
      await sendGenericPushNotification(type, {
        userId: payload?.driver?.userId,
        title: "Quotation Updated",
        message: "A driver has updated their quotation for your request",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.DRIVER_QUOTED:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "New Quote Available",
        message: "A new quote is available for your breakdown request",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.USER_ACCEPT:
    case NotificationType.DRIVER_ACCEPT:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "Request Accepted",
        message: "Your request has been accepted",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.USER_REJECT:
    case NotificationType.DRIVER_REJECT:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "Request Status Update",
        message: "There has been an update to your request",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.DRIVER_NOTIFICATION:
      await sendGenericPushNotification(type, {
        userId: payload?.driver?.userId,
        title: "New Breakdown Request",
        message: "A new breakdown request is available in your area",
        url: payload?.viewRequestLink,
      });
      break;

    case NotificationType.RATING_REVIEW:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "New Rating & Review",
        message: "You have received a new rating and review",
        url: payload?.viewRequestLink,
      });
      break;

    default:
      await sendGenericPushNotification(type, {
        userId: payload?.user?.id,
        title: "Notification",
        message: "You have a new notification",
        url: payload?.viewRequestLink,
      });
      break;
  }

  console.log(`Push notification sent for type: ${type}`, payload);
}

export const UserNotificationService = {
  sendPushNotification,
};
