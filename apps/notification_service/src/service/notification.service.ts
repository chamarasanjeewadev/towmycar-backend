import { sendPushNotification as sendPush } from "../utils/pushNotificationSender";
import { FcmRepository } from "../repository/fcm.repository";
import {
  PushNotificationPayload,
} from "@towmycar/common";
import { PushNotificationType } from "@towmycar/common";

interface NotificationMessage {
  title: string;
  body: string;
  data?: {
    url?: string;
  };
}

async function sendGenericPushNotification(
  payload: PushNotificationPayload
): Promise<void> {
  const { userId, title, message, url } = payload;

  if (!userId) {
    console.error("User ID is missing in the payload");
    return;
  }

  try {
    await FcmRepository.saveNotification({
      userId,
      title,
      message,
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
  type: PushNotificationType,
  payload: PushNotificationPayload
): Promise<void> {
  switch (type) {
    case PushNotificationType.DRIVER_ASSIGNED_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "Driver Assigned",
        message: "A driver has been assigned to your request",
        url: payload.url
      });
      break;

    case PushNotificationType.DRIVER_REGISTERED_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "Registration Complete",
        message: "Your driver registration has been received",
        url: payload.url
      });
      break;

    case PushNotificationType.USER_REQUEST_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "New Request",
        message: "Your breakdown assistance request has been received",
        url: payload.url
      });
      break;

    case PushNotificationType.DRIVER_QUOTATION_UPDATED_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "Quotation Updated",
        message: "A driver has updated their quotation for your request",
        url: payload.url
      });
      break;

    case PushNotificationType.DRIVER_QUOTE_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "New Quote Available",
        message: "A new quote is available for your breakdown request",
        url: payload.url
      });
      break;

    case PushNotificationType.USER_ACCEPT_NOTIFICATION:
    case PushNotificationType.DRIVER_ACCEPT_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "Request Accepted",
        message: payload.message || "Your request has been accepted",
        url: payload.url
      });
      break;

    case PushNotificationType.USER_REJECT_NOTIFICATION:
    case PushNotificationType.DRIVER_REJECT_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "Request Status Update",
        message: payload.message || "There has been an update to your request",
        url: payload.url
      });
      break;

    case PushNotificationType.NOTIFY_DRIVER_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "New Breakdown Request",
        message: "A new breakdown request is available in your area",
        url: payload.url
      });
      break;

    case PushNotificationType.RATING_REVIEW_NOTIFICATION:
      await sendGenericPushNotification({
        userId: payload.userId,
        title: "New Rating & Review",
        message: "You have received a new rating and review",
        url: payload.url
      });
      break;

    default:
      // Handle any other notification types with generic notification
      await sendGenericPushNotification({
        userId: payload.userId,
        title: payload.title || "Notification",
        message: payload.message || "You have a new notification",
        url: payload.url
      });
      break;
  }

  console.log(`Push notification sent for type: ${type}`, payload);
}

export const UserNotificationService = {
  sendPushNotification,
};
