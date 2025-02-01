import { ListnerPayload, maskText, NotificationType, QUOTATION_NO } from "@towmycar/common";
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
): { message: string; viewLink?: string; phoneNumber?: string } {
  const requestId = payload?.breakdownRequestId
    ? `${QUOTATION_NO}: ${payload?.breakdownRequestId}`
    : "";

  switch (type) {
    case NotificationType.DRIVER_ASSIGNED:
      return {
        phoneNumber: payload.user?.phoneNumber,
        message: `A driver has been assigned to your request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_REGISTERED:
      return {
        phoneNumber: payload.driver?.phoneNumber,
        message: `Your driver registration has been received ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.USER_REQUEST:
      return {
        phoneNumber: payload.driver?.phoneNumber,
        message: `Your breakdown assistance request has been received ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTATION_UPDATED:
      return {
        phoneNumber: payload.user?.phoneNumber,
        message: `Driver ${maskText(payload?.driver?.firstName ?? "****")} has updated their quotation for your request`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTED:
      return {
        phoneNumber: payload.user?.phoneNumber,
        message: `Driver ${maskText(payload?.driver?.firstName ?? "****")} has quoted for your request`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.USER_ACCEPTED:
      return {
        phoneNumber: payload.driver?.phoneNumber,
        message: `User ${maskText(payload?.user?.firstName ?? "****")} has accepted your quotation for request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };
    case NotificationType.DRIVER_ACCEPTED:
      return {
        phoneNumber: payload.user?.phoneNumber,
        message: `Your request has been accepted. ${requestId}, Driver will contact you soon. Click to view details`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.USER_REJECTED:
      return {
        phoneNumber: payload.driver?.phoneNumber,
        message: `User decided to cancel request ${requestId}`,
        viewLink: payload.viewRequestLink,
      };
    case NotificationType.DRIVER_REJECTED:
      return {
        phoneNumber: payload.user?.phoneNumber,
        message: `Driver decided to reject request ${requestId} you can try another user`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.DRIVER_NOTIFICATION:
      return {
        phoneNumber: payload.driver?.phoneNumber,
        message: `A new assistance request is available in your area ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    case NotificationType.RATING_REVIEW:
      return {
        phoneNumber: payload.user?.phoneNumber,
        message: `You have received a new rating and review ${requestId}`,
        viewLink: payload.viewRequestLink,
      };

    // default:
    //   return {
    //     phoneNumber: payload.user?.phoneNumber,
    //     message: `You have a new notification ${requestId}`,
    //     viewLink: payload.viewRequestLink,
    //   };
  }
}

async function sendSMSNotification(
  type: NotificationType,
  payload: ListnerPayload
): Promise<void> {
  const notificationPayload = generateSMSNotificationPayload(type, payload);
  const phoneNumber = notificationPayload?.phoneNumber;

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
