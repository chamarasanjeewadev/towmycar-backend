import { Twilio } from 'twilio';
import { SMSProvider } from '../types';
import { logger } from '../../../utils';

export class TwilioProvider implements SMSProvider {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        to: "+447366616963",//phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    } catch (error) {
      logger.error('Twilio SMS sending error:', error);
      throw error;
    }
  }
} 