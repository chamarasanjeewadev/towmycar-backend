import { contactUsAdminNotificationEmail } from './../templates/contactusAdminNotificationEmail';
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
  ContactUsPayload,
  DriverAcceptPayload,
  DriverCreatedAdminNotificationPayload,
  DriverNotificationPayload,
  DriverQuotationUpdatedPayload,
  DriverQuotedPayload,
  DriverRejectPayload,
  EmailPayloadType,
  ListnerPayload,
  logger,
  NotificationType,
  RatingReviewPayload,
  UserAcceptedPayload,
} from "@towmycar/common";
import { RatingRequestEmail } from "../templates/RatingRequestEmail";
import { userRejectedEmail } from "../templates/userRejectedEmail";
import { adminApprovalRequestEmail } from "../templates/adminApprovalRequestEmail";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { driverCreatedAdminNotificationEmail } from "../templates/driverCreatedAdminNotificationEmail";
import { EmailProvider, EmailOptions } from './email/types';
import { BrevoProvider } from './email/providers/brevo.provider';
import { SESProvider } from './email/providers/ses.provider';
 import { MailerSendProvider } from './email/providers/mailersend.provider';

class EmailFactory {
  static getProvider(options: EmailOptions): EmailProvider {
    switch (options.provider) {
      case 'ses':
        return new SESProvider();
      case 'mailersend':
        return new MailerSendProvider();
      case 'brevo':
        return new BrevoProvider();
      default:
        throw new Error(`Unsupported email provider: ${options.provider}`);
    }
  }
}

// Example usage
export const sendEmailWithProvider = async (payload: EmailPayloadType, options: EmailOptions) => {
  const emailProvider = EmailFactory.getProvider(options);
  return await emailProvider.sendEmail(payload);
};

// Configure the AWS SDK
// const sesClient = new SESClient();

// Configure SendGrid
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
// const mailerSenderAPIKEY=process.env.MAILERSENDER_API_KEY!;


// export const sendEmail = async (payload: EmailPayloadType) => {
//   try {
//     const params = {
//      Source: "TowMyCar <hello@towmycar.uk>",
//       Destination: {
//         ToAddresses: [payload.recipientEmail ],
//       },
//       Message: {
//         Subject: {
//           Data: payload.subject as string,
//           Charset: "UTF-8",
//         },
//         Body: {
//           Html: {
//             Data: payload.htmlBody,
//             Charset: "UTF-8",
//           },
//         },
//       },
//     };

//     const command = new SendEmailCommand(params);
//     const response = await sesClient.send(command);

//     console.log(
//       `Email sent to ${JSON.stringify(response)} for request ${payload}: ${
//         response.MessageId
//       }`
//     );
//     return response;
//   } catch (error) {
//     console.error(
//       `Failed to send email to ${payload} for request ${payload}:`,
//       error
//     );
//   }
// };
// export const sendEmailWithMailerSend=async(payload:EmailPayloadType)=>{
//   const sentFrom = new Sender("hello@towmycar.uk", "TowMyCar");
//   const recipients = [
//     new Recipient(payload?.recipientEmail, "")
//   ];
//   try {
//   const mailerSend = new MailerSend({
//     apiKey:mailerSenderAPIKEY,
//   });
  
  
  
//   const emailParams = new EmailParams()
//     .setFrom(sentFrom)
//     .setTo(recipients)
//     // .setReplyTo(sentFrom)
//     .setSubject(payload.subject)
//     .setHtml(payload.htmlBody)
  
//  const response =await mailerSend.email.send(emailParams); 
//  logger.info(`Send email to ${payload} for request ${payload}`) 
//  logger.info(`Email sent to response, ${JSON.stringify(response)}`)
//  return true;
// } catch (error) {
//   logger.error(
//     `Failed to send email to ${JSON.stringify(recipients)} for request ${JSON.stringify(payload)}:`,
//     error
//   );
//   return false
// }
// }

// Update the getEmailContent function
export function getEmailContent(type: NotificationType, payload: ListnerPayload) {
  switch (type) {
    case NotificationType.USER_REQUEST:
      return userRequestEmail(payload);
    case NotificationType.DRIVER_ACCEPTED:
      return driverAcceptEmail(payload as DriverAcceptPayload);
    case NotificationType.USER_ACCEPTED:
      return userAcceptEmail(payload as UserAcceptedPayload);
    case NotificationType.USER_REJECTED:
      return userRejectedEmail(payload);
    case NotificationType.DRIVER_REJECTED:
      return driverRejectEmail(payload as DriverRejectPayload);
    case NotificationType.DRIVER_QUOTED:
      return driverQuotationUpdatedEmail(payload as DriverQuotedPayload);
    case NotificationType.DRIVER_QUOTATION_UPDATED:
      return driverQuotationUpdatedEmail(payload as DriverQuotationUpdatedPayload);
    case NotificationType.USER_CREATED:
      return userCreatedEmail(payload);
    case NotificationType.DRIVER_ASSIGNED:
      return driverNotificationEmail(payload as DriverNotificationPayload);
    case NotificationType.USER_NOTIFICATION:
      return userNotificationEmail(payload);
    case NotificationType.DRIVER_NOTIFICATION:
      return driverNotificationEmail(payload as DriverNotificationPayload);
    case NotificationType.RATING_REVIEW:
      return RatingRequestEmail(payload as RatingReviewPayload);
    case NotificationType.ADMIN_APPROVAL_REQUEST:
      return adminApprovalRequestEmail(payload as AdminApprovalRequestPayload);
    case NotificationType.DRIVER_CREATED_ADMIN_NOTIFICATION:
      return driverCreatedAdminNotificationEmail(payload as DriverCreatedAdminNotificationPayload);
      case NotificationType.ADMIN_CONTACTUS_NOTIFICATION:
        return contactUsAdminNotificationEmail(payload as ContactUsPayload); 
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
