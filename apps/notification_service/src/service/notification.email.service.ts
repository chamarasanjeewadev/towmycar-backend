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
  AdminApprovalRequestPayload,
  DriverNotificationPayload,
  EmailPayloadType,
  logger,
  NotificationType,
} from "@towmycar/common";
import { RatingRequestEmail } from "../templates/RatingRequestEmail";
import { userRejectedEmail } from "../templates/userRejectedEmail";
import { adminApprovalRequestEmail } from "../templates/adminApprovalRequestEmail";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { driverCreatedAdminNotificationEmail } from "templates/driverCreatedAdminNotificationEmail";


// Configure the AWS SDK
const sesClient = new SESClient();

// Configure SendGrid
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const mailerSenderAPIKEY=process.env.MAILERSENDER_API_KEY!;


export const sendEmail = async (payload: EmailPayloadType) => {
  try {
    const params = {
     Source: "TowMyCar <hello@towmycar.uk>",
      Destination: {
        ToAddresses: [payload.recipientEmail, "chamara.sanjeewa@gmail.com"],
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
export const sendEmailWithMailerSend=async(payload:EmailPayloadType)=>{
  try {
  const mailerSend = new MailerSend({
    apiKey:mailerSenderAPIKEY,
  });
  
  const sentFrom = new Sender("hello@towmycar.uk", "TowMyCar");
  const recipients = [
    new Recipient(payload.recipientEmail, "Your Client")
  ];
  
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    // .setReplyTo(sentFrom)
    .setSubject(payload.subject)
    .setHtml(payload.htmlBody)
  
 const response =await mailerSend.email.send(emailParams);  
 return response;
} catch (error) {
  logger.error(
    `Failed to send email to ${payload} for request ${payload}:`,
    error
  );
}
}

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
    case NotificationType.DRIVER_QUOTED:
      return driverQuotationUpdatedEmail(payload);
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
    case NotificationType.ADMIN_APPROVAL_REQUEST:
      return adminApprovalRequestEmail(payload as AdminApprovalRequestPayload);
    case NotificationType.DRIVER_CREATED_ADMIN_NOTIFICATION:
      return driverCreatedAdminNotificationEmail(payload as AdminApprovalRequestPayload);
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
