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
  DriverNotificationEmailType,
  NotificationType,
} from "@towmycar/common";
import { RatingRequestEmail } from "../templates/RatingRequestEmail";

// Configure the AWS SDK
const sesClient = new SESClient();

export const sendEmail = async(type: NotificationType, payload: any) => {
  try {
    console.log("payload in sendEmail", type, payload);
    const emailContent = getEmailContent(type, payload);

    const params = {
      Source: "towmycar.uk@gmail.com",
      Destination: {
        ToAddresses: ["towmycar.uk@gmail.com"],
      },
      Message: {
        Subject: {
          Data: emailContent.subject as string,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: emailContent.htmlBody,
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
function getEmailContent(type: NotificationType, payload: any) {
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
      return driverNotificationEmail(payload  as DriverNotificationEmailType);
    case NotificationType.USER_NOTIFICATION:
      return userNotificationEmail(payload);
    case NotificationType.DRIVER_NOTIFICATION:
      return driverNotificationEmail(payload as DriverNotificationEmailType);
    case NotificationType.RATING_REVIEW:
      return RatingRequestEmail({
        requestId: payload.breakdownRequestId,
        link: payload.viewRequestLink,
      });
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
