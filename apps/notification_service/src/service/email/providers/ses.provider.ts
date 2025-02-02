import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailPayloadType } from "@towmycar/common";
import { BaseEmailProvider } from './base.provider';

export class SESProvider extends BaseEmailProvider {
  private sesClient: SESClient;

  constructor() {
    super();
    this.sesClient = new SESClient();
  }

  async sendEmail(payload: EmailPayloadType): Promise<boolean> {
    try {
      const params = {
        Source: `${this.fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [payload.recipientEmail],
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
      const response = await this.sesClient.send(command);

      this.logSuccess('SES', payload.recipientEmail, `MessageId: ${response.MessageId}`);
      return true;
    } catch (error) {
      this.logError('SES', error);
      return false;
    }
  }
}