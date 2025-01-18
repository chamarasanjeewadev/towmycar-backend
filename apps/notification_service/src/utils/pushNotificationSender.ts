import { logger } from "@towmycar/common";
import admin from "./firebase-admin";

interface NotificationPayload {
  title: string;
  body: string;
}

export const sendPushNotification = async (
  registrationTokens: string[],
  payload: NotificationPayload
) => {
  const messages = registrationTokens.map(token => ({
    notification: {
      title: payload.title,
      body: payload.body,
    },
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        // icon: '/path/to/icon.png',
        // click_action: {payload.body},
      },
      fcm_options: {
        link: `https://towmycar.uk`,
      },
      headers: {
        Urgency: 'high',
      },
    },
    data: {
      title: payload.title,
      body: payload.body,
      timestamp: Date.now().toString(),
    },
    token: token,
  }));
  // const message = {
  //   notification: {
  //     title: payload.title,
  //     body: payload.body,
  //   },
  //   data: {
  //     body: payload.body, // Add custom data fields
  //    title:payload.title,
  //   },
  //   token: registrationToken,
  // };
  try {
    const response = await admin.messaging().sendEach(messages);
    logger.info(
      `Successfully sent batch notifications:`,
      `${response.successCount} successful, ${response.failureCount} failed`
    );
    return response;
  } catch (error) {
    console.error("Error sending batch notifications:", error);
    throw error;
  }

  // try {
  //   const response = await admin.messaging().send(message);
  //   console.log("Notification sent successfully:", response);
  // } catch (error) {
  //   console.error("Error sending notification:", error);
  // }
};
export const sendBatchPushNotifications = async (
  registrationTokens: string[],
  payload: NotificationPayload
) => {
  const messages = registrationTokens.map(token => ({
    notification: {
      title: payload.title,
      body: payload.body,
    },
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        // icon: '/path/to/icon.png',
        // click_action: {payload.body},
      },
      fcm_options: {
        link: `https://towmycar.uk`,
      },
      headers: {
        Urgency: 'high',
      },
    },
    data: {
      title: payload.title,
      body: payload.body,
      timestamp: Date.now().toString(),
    },
    token: token,
  }));

  try {
    const response = await admin.messaging().sendEach(messages);
    console.log(
      `Successfully sent batch notifications:`,
      `${response.successCount} successful, ${response.failureCount} failed`
    );
    return response;
  } catch (error) {
    console.error("Error sending batch notifications:", error);
    throw error;
  }
};