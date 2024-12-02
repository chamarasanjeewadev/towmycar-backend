import { SQSHandler } from "aws-lambda";
import { SMS_CONFIG } from "../config";
import { getSMSProvider } from "../utils/sms/smsProviderFactory";

export const handler: SQSHandler = async (event) => {
  // Skip processing if SMS is disabled
  if (!SMS_CONFIG.isEnabled) {
    console.log('SMS notifications are disabled, skipping processing');
    return;
  }

  const smsProvider = getSMSProvider();
  if (!smsProvider) {
    console.log('No SMS provider available, skipping processing');
    return;
  }

  // Rest of your SMS processing logic...
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    // Your existing SMS sending logic...
  }
};
