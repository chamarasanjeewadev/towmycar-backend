import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { EmailPayloadType } from "@towmycar/common";
import { BaseEmailProvider } from './base.provider';

export class MailerSendProvider extends BaseEmailProvider {
  private mailerSend: MailerSend;

  constructor() {
    super();
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSENDER_API_KEY!,
    });
  }

  async sendEmail(payload: EmailPayloadType): Promise<boolean> {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      const recipients = [new Recipient(payload.recipientEmail, "")];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(payload.subject)
        .setHtml(payload.htmlBody);

      await this.mailerSend.email.send(emailParams);
      this.logSuccess('MailerSend', payload.recipientEmail);
      return true;
    } catch (error) {
      this.logError('MailerSend', error);
      return false;
    }
  }
}