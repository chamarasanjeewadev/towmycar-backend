import { sendPushNotification as sendPush } from "../utils/pushNotificationSender";
import { FcmRepository } from "../repository/fcm.repository";
import {
  FcmNotificationPayloadType,
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

// async function sendDriverAssignedBreakdownPushNotification(
//   payload: EmailPayload
// ): Promise<void> {
//   const userId = payload?.user?.id;

//   if (!userId) {
//     console.error("User ID is missing in the payload");
//     return;
//   }

//   await sendGenericPushNotification({
//     userId: Number(userId),
//     title: "Assignment status updated",
//     message: "The status of your breakdown assignment has been updated. Tap to view details.",
//     url: "/breakdown-details", // Replace with the actual URL
//   });
// }

function sendDriverAssignedPushNotification(
  payload: FcmNotificationPayloadType
): void {
  console.log("Payload in sendDriverAssignedPushNotification:", payload);

  sendGenericPushNotification({
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    url: payload.url, // Replace with the actual URL
  });
}

async function sendPushNotification(
  type: PushNotificationType,
  payload: FcmNotificationPayloadType
): Promise<void> {
  if (type === PushNotificationType.DRIVER_ASSIGNED_NOTIFICATION) {
    sendDriverAssignedPushNotification(payload);
  }
  // Add more conditions for other notification types as needed
  console.log("Payload in sendPushNotification:", payload);
}

export const UserNotificationService = {
  sendPushNotification,
};
