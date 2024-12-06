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
  DriverNotificationPayload,
  EmailPayloadType,
  NotificationType,
} from "@towmycar/common";
import { RatingRequestEmail } from "../templates/RatingRequestEmail";
import { userRejectedEmail } from "../templates/userRejectedEmail";

// Configure the AWS SDK
const sesClient = new SESClient();

export const sendEmail = async (payload: EmailPayloadType) => {
  try {
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
    case NotificationType.DRIVER_ACCEPTED:
      return driverAcceptEmail(payload);
    case NotificationType.USER_ACCEPTED:
      return userAcceptEmail(payload);
    case NotificationType.USER_REJECTED:
      return userRejectedEmail(payload);
    case NotificationType.DRIVER_REJECTED:
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
      return RatingRequestEmail(payload);
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
