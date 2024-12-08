import admin from "./firebase-admin";

interface NotificationPayload {
  title: string;
  body: string;
}

export const sendPushNotification = async (
  registrationToken: string,
  payload: NotificationPayload
) => {
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    token: registrationToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
