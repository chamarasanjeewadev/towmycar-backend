
export const userNotificationEmail = (payload: any) => ({
  subject: `Update on Your Breakdown Request #${payload.breakdownRequestId}`,
  textBody: `Dear ${payload.user?.firstName || 'Valued Customer'},

Good news! We've located nearby drivers and sent out your breakdown request #${payload.breakdownRequestId}.

What happens next:
1. Nearby drivers are reviewing your request.
2. We'll update you as soon as a driver accepts.
3. You'll receive details about the driver and estimated arrival time.

You can check the status of your request at any time using this link:
${payload.viewRequestLink}

Stay safe, and rest assured we're working hard to get you assistance as quickly as possible.

If you have any questions or concerns, please don't hesitate to contact our support team.

Best regards,
Your Breakdown Assistance Team`,
  htmlBody: `
    <h1>Update on Your Breakdown Request</h1>
    <p>Dear ${payload.user?.firstName || 'Valued Customer'},</p>
    <p>Good news! We've located nearby drivers and sent out your breakdown request #${payload.breakdownRequestId}.</p>
    <h2>What happens next:</h2>
    <ol>
      <li>Nearby drivers are reviewing your request.</li>
      <li>We'll update you as soon as a driver accepts.</li>
      <li>You'll receive details about the driver and estimated arrival time.</li>
    </ol>
    <p>You can check the status of your request at any time using the button below:</p>
    <p><a href="${payload.viewRequestLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">View Request Status</a></p>
    <p>Stay safe, and rest assured we're working hard to get you assistance as quickly as possible.</p>
    <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
    <p>Best regards,<br>Your Breakdown Assistance Team</p>
  `,
});