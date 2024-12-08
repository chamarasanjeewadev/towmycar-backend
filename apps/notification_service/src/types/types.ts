export interface SMSProvider {
    sendSMS(phoneNumber: string, message: string): Promise<void>;
  } 