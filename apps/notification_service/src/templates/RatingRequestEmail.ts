import { BaseNotificationPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export function RatingRequestEmail(payload: BaseNotificationPayload)  {
  const content = `
    <h1>Rate Your TowMyCar Experience</h1>
    <p>Dear valued customer,</p>
    <p>We hope your recent towing experience with TowMyCar (Request ID: ${payload?.breakdownRequestId}) met your expectations. Your feedback is crucial in helping us improve our services.</p>
    <p>We'd greatly appreciate it if you could take a moment to rate your experience and provide any additional comments.</p>
    <p>Your input helps us ensure we're providing the best possible service to all our customers.</p>
    <p>Thank you for choosing TowMyCar!</p>
    
    <div style="text-align: center;">
      <a href="${payload?.viewRequestLink}" class="button">Rate Your Experience</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({
    content,
  });

  return {
    subject: "Rate Your TowMyCar Experience",
    htmlBody,
  };
}
