import twilio from "twilio";
import { SMS_CONFIG } from "../../../config";
import { SMSProvider } from "types/types";

export class TwilioProvider implements SMSProvider {
  private client: twilio.Twilio;

  constructor() {
    if (!SMS_CONFIG.twilio.accountSid || !SMS_CONFIG.twilio.authToken) {
      throw new Error("Twilio credentials not configured");
    }

    this.client = twilio(
      SMS_CONFIG.twilio.accountSid,
      SMS_CONFIG.twilio.authToken
    );
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        to,
        from: SMS_CONFIG.twilio.phoneNumber,
      });
    } catch (error) {
      console.error("Failed to send SMS via Twilio:", error);
      throw new Error("SMS sending failed");
    }
  }
} 