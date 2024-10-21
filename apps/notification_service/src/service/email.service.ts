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
  EmailNotificationType,
} from "@towmycar/database/enums";
import { EmailPayloadBaseType, EmailPayloadType } from "@towmycar/database/types/types";

// Configure the AWS SDK
const sesClient = new SESClient();

export const sendEmail = async (
  type: EmailNotificationType,
  payload: EmailPayloadType & EmailPayloadBaseType
) => {
  try {
    console.log("payload in sendEmail", type, payload);
    const emailContent = getEmailContent(type, payload);

    const params = {
      Source: "towmycar.uk@gmail.com",
      Destination: {
        ToAddresses: [payload.recipientEmail ?? "towmycar.uk@gmail.com"],
      },
      Message: {
        Subject: {
          Data: emailContent.subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: emailContent.textBody,
            Charset: "UTF-8",
          },
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
function getEmailContent(type: EmailNotificationType, payload: EmailPayloadBaseType) {
  switch (type) {
    case EmailNotificationType.USER_REQUEST_EMAIL:
      return userRequestEmail(payload);
    case EmailNotificationType.DRIVER_ACCEPT_EMAIL:
      return driverAcceptEmail(payload);
    case EmailNotificationType.USER_ACCEPT_EMAIL:
      return userAcceptEmail(payload);
    case EmailNotificationType.DRIVER_REJECT_EMAIL:
      return driverRejectEmail(payload);
    case EmailNotificationType.DRIVER_QUOTATION_UPDATED_EMAIL:
      return driverQuotationUpdatedEmail(payload);
    case EmailNotificationType.USER_CREATED_EMAIL:
      return userCreatedEmail(payload);
    case EmailNotificationType.DRIVER_ASSIGNED_EMAIL:
      return driverNotificationEmail(payload);
    case EmailNotificationType.USER_NOTIFICATION_EMAIL:
      return userNotificationEmail(payload);
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
