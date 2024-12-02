import { NotificationPayload, NotificationType } from "@towmycar/common";
import { getSMSProvider } from "./../utils/sms/smsProviderFactory";

const smsProvider=getSMSProvider();
async function sendGenericSMS(phoneNumber: string, message: string, viewLink?: string): Promise<void> {
  try {
    const fullMessage = viewLink 
      ? `${message}\nView details: ${viewLink}`
      : message;

    await smsProvider.sendSMS(phoneNumber, fullMessage);
    
    console.log(`SMS sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}

async function sendSMSNotification(
  type: NotificationType,
  payload: NotificationPayload
): Promise<void> {
  switch (type) {
    case NotificationType.DRIVER_ASSIGNED:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "A driver has been assigned to your request",
        payload.viewRequestLink
      );
      break;

    case NotificationType.DRIVER_REGISTERED:
      await sendGenericSMS(
        payload.driver.phoneNumber,
        "Your driver registration has been received",
        payload.viewRequestLink
      );
      break;

    case NotificationType.USER_REQUEST:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "Your breakdown assistance request has been received",
        payload.viewRequestLink
      );
      break;

    case NotificationType.DRIVER_QUOTATION_UPDATED:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "A driver has updated their quotation for your request",
        payload.viewRequestLink
      );
      break;

    case NotificationType.DRIVER_QUOTE:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "A new quote is available for your breakdown request",
        payload.viewRequestLink
      );
      break;

    case NotificationType.USER_ACCEPT:
    case NotificationType.DRIVER_ACCEPT:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "Your request has been accepted",
        payload.viewRequestLink
      );
      break;

    case NotificationType.USER_REJECT:
    case NotificationType.DRIVER_REJECT:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "There has been an update to your request",
        payload.viewRequestLink
      );
      break;

    case NotificationType.DRIVER_NOTIFICATION:
      await sendGenericSMS(
        payload.driver.phoneNumber,
        "A new breakdown request is available in your area",
        payload.viewRequestLink
      );
      break;

    case NotificationType.RATING_REVIEW:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "You have received a new rating and review",
        payload.viewRequestLink
      );
      break;

    default:
      await sendGenericSMS(
        payload.user.phoneNumber,
        "You have a new notification",
        payload.viewRequestLink
      );
      break;
  }

  console.log(`SMS notification sent for type: ${type}`, payload);
}

export const SMSNotificationService = {
  sendSMSNotification,
}; 