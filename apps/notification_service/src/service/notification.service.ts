import { EmailNotificationType } from "../enums";
import { sendPushNotification } from "../utils/pushNotificationSender";
import { EmailPayload } from "./email.service";
import { DriverSearchRepository } from "../repository/fcm.repository";

export const sendDriverAcceptanceBreakdownPushNotification = async (
  type: EmailNotificationType,
  payload: EmailPayload
) => {
  // Get the user ID from the payload
  //@ts-nocheck
  const userId = payload?.user?.id;

  if (!userId) {
    console.error("User ID is missing in the payload");
    return;
  }

  try {
    // Get all active FCM tokens for the user
    const tokens = await DriverSearchRepository.getFcmTokensByUserId(+userId);

    if (tokens.length === 0) {
      console.log(`No active FCM tokens found for user ${userId}`);
      return;
    }

    // Filter out duplicate tokens
    const uniqueTokens = Array.from(new Set(tokens.map(t => t.token)));

    // Prepare the notification message
    const notificationMessage = {
      title: "Assignment status updated",
      body: "The status of the assignment has been updated",
    };

    // Send push notification to all unique tokens
    const notificationPromises = uniqueTokens.map(token =>
      sendPushNotification(token, notificationMessage)
    );

    const result = await Promise.allSettled(notificationPromises);
    console.log("result", result);
    console.log(`Push notifications sent to ${uniqueTokens.length} unique devices for user ${userId}`);
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
};

export const UserNotificationService = {
  sendDriverAcceptanceBreakdownPushNotification,
};
