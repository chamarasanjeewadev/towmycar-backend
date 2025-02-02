import { EmailProvider } from '../types';
import { EmailPayloadType, logger } from "@towmycar/common";

export abstract class BaseEmailProvider implements EmailProvider {
  protected readonly fromEmail = "hello@towmycar.uk";
  protected readonly fromName = "TowMyCar";

  abstract sendEmail(payload: EmailPayloadType): Promise<boolean>;

  protected logSuccess(provider: string, recipientEmail: string, additionalInfo?: string) {
    logger.info(`Email sent via ${provider} to ${recipientEmail} ${additionalInfo || ''}`);
  }

  protected logError(provider: string, error: any) {
    logger.error(`Failed to send email via ${provider}:`, error);
  }
}