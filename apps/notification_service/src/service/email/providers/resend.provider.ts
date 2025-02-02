import { Resend } from 'resend';
import { EmailPayloadType } from "@towmycar/common";
import { BaseEmailProvider } from './base.provider';

export class ResendProvider extends BaseEmailProvider {
  private resend: Resend;

  constructor() {
    super();
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }

  async sendEmail(payload: EmailPayloadType): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [payload.recipientEmail],
        subject: payload.subject,
        html: payload.htmlBody,
      });

      this.logSuccess('Resend', payload.recipientEmail);
      return true;
    } catch (error) {
      this.logError('Resend', error);
      return false;
    }
  }
}