import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

// Configure the AWS SDK to use credentials from the local AWS config file
const sesClient = new SESClient({
  region: "us-east-1",
});

// Use an environment variable for the sender email
const SENDER_EMAIL = process.env.SENDER_EMAIL || "chamara.sanjeewa@gmail.com";

export const EmailService = {
  sendEmail: async (params: SendEmailCommandInput): Promise<string> => {
    try {
      const command = new SendEmailCommand(params);
      const response = await sesClient.send(command);
      console.log(`Email sent successfully: ${response.MessageId}`);
      return response.MessageId!;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Failed to send email");
    }
  },

  sendSESEmailNotification: async (driverEmail: string, requestId: number): Promise<string> => {
    const params: SendEmailCommandInput = {
      Source: SENDER_EMAIL,
      Destination: {
        ToAddresses: [driverEmail],
      },
      Message: {
        Subject: {
          Data: `New Request #${requestId} Available`,
          Charset: "UTF-8",
        },
        Body: {
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

    try {
      const messageId = await EmailService.sendEmail(params);
      console.log(`Email sent to ${driverEmail} for request ${requestId}: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error(`Failed to send email to ${driverEmail} for request ${requestId}:`, error);
      throw error;
    }
  },
};

