import { SMSProvider } from "./../../types/types";
import { SNSProvider } from "./providers/snsProvider";
import { TwilioProvider } from "./providers/twilioProvider";

export function getSMSProvider(): SMSProvider {
  const provider = "twilio"; // process.env.SMS_PROVIDER?.toLowerCase() || "twillio";

  switch (provider) {
    case "twilio":
      return new TwilioProvider();
    // case "sns":
    default:
      return new TwilioProvider();
  }
}
