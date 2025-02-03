import { createBaseTemplate } from "./baseTemplate";

export const userNotificationEmail = (payload: any) => {
  const content = `
    <h1>Update on Your Breakdown Request</h1>
    <p>Dear ${payload.user?.firstName || 'Valued Customer'},</p>
    <p>Good news! We've located nearby drivers and sent out your breakdown request #${payload.breakdownRequestId}.</p>
    <h2>What happens next:</h2>
    <ol>
      <li>Nearby drivers are reviewing your request.</li>
      <li>We'll update you as soon as a driver accepts.</li>
      <li>You'll receive details about the driver and estimated arrival time.</li>
    </ol>
    <p>Stay safe, and rest assured we're working hard to get you assistance as quickly as possible.</p>
    <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>

    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View Request Status</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Update on Your Breakdown Request #${payload.breakdownRequestId}`,
    htmlBody,
  };
};