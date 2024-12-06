import dotenv from "dotenv";
dotenv.config();

export const DB_URL = process.env.DB_URL;
export const SQS_QUEUE_URL = process.env.SEND_NOTIFICATION_QUEUE_URL;

export const SMS_CONFIG = {
  isEnabled: process.env.ENABLE_SMS === 'true',
  provider: process.env.SMS_PROVIDER,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
};
