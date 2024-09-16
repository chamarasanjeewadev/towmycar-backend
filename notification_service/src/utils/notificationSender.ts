import admin from './../utils//firebase-admin';

interface NotificationPayload {
  title: string;
  body: string;
}

export const sendNotification = async (registrationToken: string, payload: NotificationPayload) => {
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    token: registrationToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Example usage
// const registrationToken = 'YOUR_FCM_REGISTRATION_TOKEN';
// const payload = {
//   title: 'Hello World!',
//   body: 'This is a test notification.',
// };

// sendNotification(registrationToken, payload);
