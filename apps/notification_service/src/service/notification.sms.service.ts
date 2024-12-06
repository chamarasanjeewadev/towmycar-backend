import { ListnerPayload, NotificationType } from "@towmycar/common";
import { getSMSProvider } from "../utils/sms/smsProviderFactory";

const smsProvider = getSMSProvider();
async function sendGenericSMS(
  phoneNumber: string,
  message: string,
  viewLink?: string
): Promise<void> {
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

function generateSMSNotificationPayload(
  type: NotificationType,
  payload: ListnerPayload
): { message: string; viewLink?: string } {
  const requestId = payload.breakdownRequestId
    ? `(Request #${payload.breakdownRequestId})`
    : "";

  switch (type) {
    case NotificationType.DRIVER_ASSIGNED:
      return {
        message: `A driver has been assigned to your request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_REGISTERED:
      return {
        message: `Your driver registration has been received ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.USER_REQUEST:
      return {
        message: `Your breakdown assistance request has been received ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTATION_UPDATED:
      return {
        message: `A driver has updated their quotation for your request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTED:
      return {
        message: `A new quote is available for your breakdown request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.USER_ACCEPTED:
    case NotificationType.DRIVER_ACCEPTED:
      return {
        message: `Your request has been accepted ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.USER_REJECTED:
    case NotificationType.DRIVER_REJECTED:
      return {
        message: `There has been an update to your request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_NOTIFICATION:
      return {
        message: `A new breakdown request is available in your area ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.RATING_REVIEW:
      return {
        message: `You have received a new rating and review ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    default:
      return {
        message: `You have a new notification ${requestId}`,
        viewLink: payload.viewRequestLink,
      };
  }
}

async function sendSMSNotification(
  type: NotificationType,
  payload: ListnerPayload
): Promise<void> {
  const notificationPayload = generateSMSNotificationPayload(type, payload);
  const phoneNumber = payload.driver?.phoneNumber || payload.user?.phoneNumber;

  if (!phoneNumber) {
    console.error("No phone number provided for SMS notification");
    return;
  }

  await sendGenericSMS(
    phoneNumber,
    notificationPayload.message,
    notificationPayload.viewLink
  );

  console.log(`SMS notification sent for type: ${type}`, payload);
}

export const SMSNotificationService = {
  sendSMSNotification,
  generateSMSNotificationPayload,
};
