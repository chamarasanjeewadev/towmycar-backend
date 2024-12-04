import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { userRequestEmail } from "../templates/userRequestEmail";
import { driverAcceptEmail } from "../templates/driverAcceptEmail";
import { userAcceptEmail } from "../templates/userAcceptEmail";
import { driverRejectEmail } from "../templates/driverRejectEmail";
import { driverQuotationUpdatedEmail } from "../templates/driverQuotationUpdatedEmail";
import { userCreatedEmail } from "../templates/userCreatedEmail";
import { driverNotificationEmail } from "../templates/driverNotificationEmail";
import { userNotificationEmail } from "../templates/userNotificationEmail";
import {
  BaseNotificationType,
  DriverNotificationPayload,
  EmailPayloadType,
  NotificationType,
  UserNotificationNotificationpayload,
} from "@towmycar/common";
import { RatingRequestEmail } from "../templates/RatingRequestEmail";
import { NotificationRepository } from "repository/notification.repository";

// Configure the AWS SDK
const sesClient = new SESClient();

export const sendEmail = async (
  type: NotificationType,
  payload: EmailPayloadType
) => {
  try {
    // console.log("payload in sendEmail", type, payload);
    // const emailContent = getEmailContent(type, payload);

    // await NotificationRepository.saveNotification({
    //   userId: payload?.driver?.userId,
    //   breakdownRequestId: payload.breakdownRequestId,
    //   title: emailContent.subject,
    //   message: emailContent.htmlBody,
    //   baseNotificationType: BaseNotificationType.EMAIL,
    //   notificationType: type.toString(),
    //   payload: JSON.stringify(payload),
    //   url: payload.viewRequestLink,
    // });

    const params = {
      Source: "towmycar.uk@gmail.com",
      Destination: {
        ToAddresses: ["towmycar.uk@gmail.com"],
      },
      Message: {
        Subject: {
          Data: payload.subject as string,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: payload.htmlBody,
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log(
      `Email sent to ${JSON.stringify(response)} for request ${payload}: ${
        response.MessageId
      }`
    );
    return response;
  } catch (error) {
    console.error(
      `Failed to send email to ${payload} for request ${payload}:`,
      error
    );
  }
};

// Update the getEmailContent function
export function getEmailContent(type: NotificationType, payload: any) {
  switch (type) {
    case NotificationType.USER_REQUEST:
      return userRequestEmail(payload);
    case NotificationType.DRIVER_ACCEPT:
      return driverAcceptEmail(payload);
    case NotificationType.USER_ACCEPT:
      return userAcceptEmail(payload);
    case NotificationType.DRIVER_REJECT:
      return driverRejectEmail(payload);
    case NotificationType.DRIVER_QUOTATION_UPDATED:
      return driverQuotationUpdatedEmail(payload);
    case NotificationType.USER_CREATED:
      return userCreatedEmail(payload);
    case NotificationType.DRIVER_ASSIGNED:
      return driverNotificationEmail(payload as DriverNotificationPayload);
    case NotificationType.USER_NOTIFICATION:
      return userNotificationEmail(payload);
    case NotificationType.DRIVER_NOTIFICATION:
      return driverNotificationEmail(payload as DriverNotificationPayload);
    case NotificationType.RATING_REVIEW:
      return RatingRequestEmail({
        requestId: payload.breakdownRequestId,
        link: payload.viewRequestLink,
      });
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
