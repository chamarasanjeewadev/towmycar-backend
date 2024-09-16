import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Configure the AWS SDK
const sesClient = new SESClient();

// Email notification types enum
export enum EmailNotificationType {
  UserRequestEmail = "UserRequestEmail",
  DriverAcceptEmail = "driverAcceptEmail",
  UserAcceptEmail = "userAcceptEmail",
  DriverRejectEmail = "driverRejectEmail",
  DriverQuotationUpdatedEmail = "driverQuotationUpdatedEmail",
}

interface EmailPayload {
  recipientEmail: string;
  breakdownRequestId: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  viewRequestLink: string;
  [key: string]: any; // Allow for additional properties
}

export const sendEmail = async (
  type: EmailNotificationType,
  payload: EmailPayload
) => {
  try {
    console.log("payload in sendEmail",type, payload);
    const emailContent = getEmailContent(type, payload);

    const params = {
      Source: "chamara.sanjeewa@gmail.com",
      Destination: {
        ToAddresses: ["chamara.sanjeewa@gmail.com"],
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
      `Email sent to ${JSON.stringify(response)} for request ${payload}: ${response.MessageId}`
    );
    return response;
  } catch (error) {
    console.error(
      `Failed to send email to ${payload} for request ${payload}:`,
      error
    );
    throw error;
  }
};

function getEmailContent(type: EmailNotificationType, payload: EmailPayload) {
  const viewRequestButton = `
    <p>
      <a href="${payload?.viewRequestLink??""}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">
        View Request
      </a>
    </p>
  `;

  switch (type) {
    case EmailNotificationType.UserRequestEmail:
      return {
        subject: `New Breakdown Request #${payload.breakdownRequestId} Submitted`,
        textBody: `Hello ${payload.firstName},

Your breakdown request #${payload.breakdownRequestId} has been submitted successfully. We'll notify you when a driver accepts it.

Location: ${payload.location}
View your request: ${payload.viewRequestLink}

Best regards,
Your Company`,
        htmlBody: `
          <h1>New Breakdown Request Submitted</h1>
          <p>Hello ${payload.firstName},</p>
          <p>Your breakdown request #${payload.breakdownRequestId} has been submitted successfully. We'll notify you when a driver accepts it.</p>
          <p>Location: ${payload.location}</p>
          ${viewRequestButton}
          <p>Best regards,<br>Your Company</p>
        `,
      };
    case EmailNotificationType.DriverAcceptEmail:
      return {
        subject: `Driver Accepted Request #${payload.requestId}`,
        textBody: `Hello,\n\nA driver has accepted your request #${payload.requestId}. Driver details: ${payload.driverName}.\n\nView your request: ${payload.viewRequestLink}\n\nBest regards,\nYour Company`,
        htmlBody: `
          <h1>Driver Accepted Your Request</h1>
          <p>Hello,</p>
          <p>A driver has accepted your request #${payload.requestId}. Driver details: ${payload.driverName}.</p>
          ${viewRequestButton}
          <p>Best regards,<br>Your Company</p>
        `,
      };
    case EmailNotificationType.UserAcceptEmail:
      return {
        subject: `User Accepted Quotation for Request #${payload.requestId}`,
        textBody: `Hello,\n\nThe user has accepted your quotation for request #${payload.requestId}. Please proceed with the service.\n\nView the request: ${payload.viewRequestLink}\n\nBest regards,\nYour Company`,
        htmlBody: `
          <h1>User Accepted Your Quotation</h1>
          <p>Hello,</p>
          <p>The user has accepted your quotation for request #${payload.requestId}. Please proceed with the service.</p>
          ${viewRequestButton}
          <p>Best regards,<br>Your Company</p>
        `,
      };
    case EmailNotificationType.DriverRejectEmail:
      return {
        subject: `Driver Rejected Request #${payload.requestId}`,
        textBody: `Hello,\n\nUnfortunately, the driver has rejected your request #${payload.requestId}. We'll continue to look for another driver.\n\nView your request: ${payload.viewRequestLink}\n\nBest regards,\nYour Company`,
        htmlBody: `
          <h1>Driver Rejected Your Request</h1>
          <p>Hello,</p>
          <p>Unfortunately, the driver has rejected your request #${payload.requestId}. We'll continue to look for another driver.</p>
          ${viewRequestButton}
          <p>Best regards,<br>Your Company</p>
        `,
      };
    case EmailNotificationType.DriverQuotationUpdatedEmail:
      return {
        subject: `Quotation Updated for Request #${payload.requestId}`,
        textBody: `Hello,\n\nThe driver has updated the quotation for your request #${payload.requestId}. New price: $${payload.newPrice}. Please check your app for more details.\n\nView your request: ${payload.viewRequestLink}\n\nBest regards,\nYour Company`,
        htmlBody: `
          <h1>Quotation Updated</h1>
          <p>Hello,</p>
          <p>The driver has updated the quotation for your request #${payload.requestId}. New price: $${payload.newPrice}. Please check your app for more details.</p>
          ${viewRequestButton}
          <p>Best regards,<br>Your Company</p>
        `,
      };
    default:
      throw new Error(`Invalid email notification type: ${type}`);
  }
}
