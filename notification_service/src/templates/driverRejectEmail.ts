import { EmailPayload } from '../service/email.service';

export const driverRejectEmail = (payload: EmailPayload) => ({
  subject: `Driver Rejected Request #${payload.requestId}`,
  textBody: `Hello,

Unfortunately, the driver has rejected your request #${payload.requestId}. We'll continue to look for another driver.

View your request: ${payload.viewRequestLink}

Best regards,
Your Company`,
  htmlBody: `
    <h1>Driver Rejected Your Request</h1>
    <p>Hello,</p>
    <p>Unfortunately, the driver has rejected your request #${payload.requestId}. We'll continue to look for another driver.</p>
    <p><a href="${payload.viewRequestLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">View Request</a></p>
    <p>Best regards,<br>Your Company</p>
  `,
});