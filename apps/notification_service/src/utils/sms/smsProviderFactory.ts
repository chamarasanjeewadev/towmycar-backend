import { SMS_CONFIG } from "../../config";
import { SMSProvider } from "./../../types/types";
import { TwilioProvider } from "./providers/twilioProvider";

export function getSMSProvider(): SMSProvider | null {
  // Return null if SMS is disabled
  if (!SMS_CONFIG.isEnabled) {
    console.log('SMS notifications are disabled');
    return null;
  }

  const provider = "twilio"; // process.env.SMS_PROVIDER?.toLowerCase() || "twillio";

  switch (provider) {
    case "twilio":
      return new TwilioProvider();
    // case "sns":
    default:
      return new TwilioProvider();
  }
}
