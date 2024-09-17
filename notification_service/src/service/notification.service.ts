
import { sendPushNotification } from "../utils/pushNotificationSender";

export const sendDriverAcceptanceBreakdownPushNotification = async () => {

  await sendPushNotification(
    "cjAfcHdk6YZc5lZAMZrJtk:APA91bFXKN5lFet7-YyqKVSaIjHhxsRCVESyXKWNQ58izuXHN3SWEZcGJUJsPBzyzkZn3Ky8CCzfj3lBRWJCnq9rr8KGs64n3VkH_5t3-aFZ5TtpafYeVoz9HNX8c4grE7eDQkkQXPYQ",
    {
      title: "Assignment status updated",
      body: "The status of the assignment has been updated",
    }
  );
};

export const UserNotificationService= {
  sendDriverAcceptanceBreakdownPushNotification,
};
