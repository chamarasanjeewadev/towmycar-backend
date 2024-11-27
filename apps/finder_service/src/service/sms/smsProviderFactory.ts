import { SMSProvider } from './types';
import { SNSProvider } from './providers/snsProvider';
import { TwilioProvider } from './providers/twilioProvider';

export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER?.toLowerCase() || 'sns';
  
  switch (provider) {
    case 'twilio':
      return new TwilioProvider();
    case 'sns':
    default:
      return new SNSProvider();
  }
} 