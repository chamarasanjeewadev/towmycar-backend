import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Configure the AWS SDK
const sesClient = new SESClient({
  region: "YOUR_AWS_REGION", // e.g., "us-east-1"
  credentials: {
    accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY"
  }
});

export const EmailService = {
  sendNewRequestNotification: async (driverEmail: string, requestId: number) => {
    try {
      const params = {
        Source: "Your Company <noreply@yourcompany.com>",
        Destination: {
          ToAddresses: [driverEmail],
        },
        Message: {
          Subject: {
            Data: `New Request #${requestId} Available`,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: `Hello,\n\nA new request #${requestId} is available in your area. Please check your driver app for more details.\n\nBest regards,\nYour Company`,
              Charset: "UTF-8",
            },
            Html: {
              Data: `
                <h1>New Request Available</h1>
                <p>Hello,</p>
                <p>A new request #${requestId} is available in your area. Please check your driver app for more details.</p>
                <p>Best regards,<br>Your Company</p>
              `,
              Charset: "UTF-8",
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      const response = await sesClient.send(command);

      console.log(`Email sent to ${driverEmail} for request ${requestId}: ${response.MessageId}`);
      return response;
    } catch (error) {
      console.error(`Failed to send email to ${driverEmail} for request ${requestId}:`, error);
      throw error;
    }
  },
};