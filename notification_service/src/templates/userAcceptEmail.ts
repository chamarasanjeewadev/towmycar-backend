import { EmailPayload } from '../service/email.service';

export const userAcceptEmail = (payload: EmailPayload) => ({
  subject: `User Accepted Quotation for Request #${payload.requestId}`,
  textBody: `Hello,

The user has accepted your quotation for request #${payload.requestId}. Please proceed with the service.

View the request: ${payload.viewRequestLink}

Best regards,
Your Company`,
  htmlBody: `
    <h1>User Accepted Your Quotation</h1>
    <p>Hello,</p>
    <p>The user has accepted your quotation for request #${payload.requestId}. Please proceed with the service.</p>
    <p><a href="${payload.viewRequestLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">View Request</a></p>
    <p>Best regards,<br>Your Company</p>
  `,
});