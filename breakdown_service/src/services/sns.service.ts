import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

class SNSService {
  private snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({ region: process.env.AWS_REGION });
  }

  async sendNotification(topicArn: string, message: any) {
    try {
      const snsParams = {
        Message: JSON.stringify(message),
        TopicArn: topicArn,
      };

      const command = new PublishCommand(snsParams);
      await this.snsClient.send(command);
      console.log(`SNS notification sent: ${JSON.stringify(message)}`);
    } catch (error) {
      console.error("Error sending SNS notification:", error);
      // Handle error as needed
    }
  }
}

export const snsService = new SNSService();
