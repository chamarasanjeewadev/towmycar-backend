import * as Brevo from '@getbrevo/brevo';
import { EmailPayloadType } from "@towmycar/common";
import { BaseEmailProvider } from './base.provider';

export class BrevoProvider extends BaseEmailProvider {
  private apiInstance: Brevo.TransactionalEmailsApi;

  constructor() {
    super();
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(0, process.env.BREVO_API_KEY!);
  }

  async sendEmail(payload: EmailPayloadType): Promise<boolean> {
    try {
      const senderObj={
        sender: { name: this.fromName, email: "hello@towmycar.uk" },
        to: [{ email: payload.recipientEmail }],
        subject: payload.subject,
        htmlContent: payload.htmlBody,
        // params: payload.params || {},
        // attachment: payload.attachments || null!
      }
      await this.apiInstance.sendTransacEmail(senderObj);

      this.logSuccess('Brevo', payload.recipientEmail);
      return true;
    } catch (error) {
      this.logError('Brevo', error);
      return false;
    }
  }
}