import { EmailPayload } from '../service/email.service';

export const driverQuotationUpdatedEmail = (payload: EmailPayload) => ({
  subject: `Great news! Quotation ready for your Request #${payload.requestId}`,
  textBody: `Hello ${payload.user?.firstName || 'Valued Customer'},

Good news! A driver has provided a quotation for your breakdown request #${payload.requestId}.

Quotation details:
- Price: $${payload.newPrice}
- Estimated cost: ${payload.estimation}
- Description: ${payload.description}

If this quotation looks good to you, please review and accept it in our app. The sooner you accept, the quicker we can get you back on the road!

View and accept the quotation: ${payload.viewRequestLink}

If you have any questions, don't hesitate to reach out.

Best regards,
Your Breakdown Assistance Team`,
  htmlBody: `
    <h1>Great news! Quotation ready for your request</h1>
    <p>Hello ${payload.user?.firstName || 'Valued Customer'},</p>
    <p>Good news! A driver has provided a quotation for your breakdown request #${payload.requestId}.</p>
    <h2>Quotation details:</h2>
    <ul>
      <li><strong>Price:</strong> $${payload.newPrice}</li>
      <li><strong>Estimated cost:</strong> ${payload.estimation}</li>
      <li><strong>Description:</strong> ${payload.description}</li>
    </ul>
    <p>If this quotation looks good to you, please review and accept it in our app. The sooner you accept, the quicker we can get you back on the road!</p>
    <p><a href="${payload.viewRequestLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">View and Accept Quotation</a></p>
    <p>If you have any questions, don't hesitate to reach out.</p>
    <p>Best regards,<br>Your Breakdown Assistance Team</p>
  `,
});