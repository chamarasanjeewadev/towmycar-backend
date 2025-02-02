import { EmailPayloadType } from "@towmycar/common";

export interface EmailProvider {
  sendEmail(payload: EmailPayloadType): Promise<boolean>;
}

export interface EmailOptions {
  provider: 'ses' | 'mailersend' | 'resend';
}