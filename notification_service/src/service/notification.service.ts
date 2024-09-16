import {
  DriverSearchRepository,
  DriverSearchRepositoryType,
  NearbyDriver,
} from "../repository/driversearch.repository";
import { EmailService } from "./email.service"; // Add this import
import { sendNotification } from "../utils/notificationSender";
import { sendEmail } from "../utils/email.service";

const sendDriverAcceptanceNotification = async (
  driverEmail: string,
  requestId: number
) => {
  await EmailService.sendSESEmailNotification(driverEmail, requestId);
};

const sendDriverAcceptanceBreakdownNotification = async () => {
  EmailService.sendSESEmailNotification("chamara.sanjeewa@gmail.com", 1);
 
  await sendNotification(
    "cjAfcHdk6YZc5lZAMZrJtk:APA91bFXKN5lFet7-YyqKVSaIjHhxsRCVESyXKWNQ58izuXHN3SWEZcGJUJsPBzyzkZn3Ky8CCzfj3lBRWJCnq9rr8KGs64n3VkH_5t3-aFZ5TtpafYeVoz9HNX8c4grE7eDQkkQXPYQ",
    {
      title: "Assignment status updated",
      body: "The status of the assignment has been updated",
    }
  );
};

export const UserNotificationService: any = {
  sendDriverAcceptanceNotification,
  sendDriverAcceptanceBreakdownNotification,
};
