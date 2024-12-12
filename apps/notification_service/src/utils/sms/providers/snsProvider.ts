import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SMSProvider } from "../../../types/types";
import { logger } from "@towmycar/common";

export class SNSProvider implements SMSProvider {
  private client: SNSClient;

  constructor() {
    this.client = new SNSClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    const smsParams = {
      PhoneNumber: phoneNumber,
      Message: message,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "TOW-MY-CAR",
        },
      },
    };

    try {
      const command = new PublishCommand(smsParams);
      await this.client.send(command);
    } catch (error) {
      logger.error("SNS SMS sending error:", error);
      throw error;
    }
  }
}
