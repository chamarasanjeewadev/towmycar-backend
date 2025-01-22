import { BaseNotificationPayload, notificationIcons } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export function RatingRequestEmail(payload: BaseNotificationPayload)  {
  const content = `
    <p>Dear ${payload?.user?.firstName ?? "Customer"},</p>
    <p>We hope your recent towing experience with TowMyCar met your expectations. Your feedback is crucial in helping us improve our services.</p>
    <p>We'd greatly appreciate it if you could take a moment to rate your experience and provide any additional comments.</p>
    <p>Your input helps us ensure we're providing the best possible service to all our customers.</p>
  <h2>More details:</h2>
    <ul>
    <li><strong>Reference Id:</strong> ${payload.breakdownRequestId}</li>
    </ul>  
  `;

  const htmlBody = createBaseTemplate({
    content,ctaLink: payload?.viewRequestLink,ctaText:"Rate Your Experience"
  });

  return {
    subject: `${notificationIcons.RATING_REVIEW} Rate Your TowMyCar Experience - Reference Id: ${payload.breakdownRequestId}`,
    htmlBody,
  };
}
