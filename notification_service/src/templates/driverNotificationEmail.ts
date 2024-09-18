import { EmailPayload } from '../service/email.service';

export const driverNotificationEmail = (payload: EmailPayload) => ({
  subject: `New Breakdown Request: Your Assistance Needed! - Request #${payload.breakdownRequestId}`,
  textBody: `Hello ${payload.driver?.firstName},

We have an urgent breakdown request in your area that needs your expertise!

Request Details:
- Request ID: #${payload.breakdownRequestId}
- Location: ${payload.location}
- Time Submitted: ${new Date().toLocaleString()}

User Details:
- Name: ${payload.user?.firstName} ${payload.user?.lastName}
- Phone: ${payload.user?.phoneNumber || 'Not provided'}

A driver in distress is counting on professionals like you. Your quick response can make a significant difference in their day.

To view full details and accept this request, please click the link below:
${payload.viewRequestLink}

Remember, fast response times lead to higher ratings and more business opportunities!

If you have any questions or need additional information, don't hesitate to contact our support team.

Thank you for your dedication to helping drivers in need.

Best regards,
Your Breakdown Assistance Team`,
  htmlBody: `
    <h1>New Breakdown Request: Your Assistance Needed!</h1>
    <p>Hello ${payload.driver?.fullName},</p>
    <p>We have an <strong>urgent breakdown request</strong> in your area that needs your expertise!</p>
    
    <h2>Request Details:</h2>
    <ul>
      <li><strong>Request ID:</strong> #${payload.breakdownRequestId}</li>
      <li><strong>Location:</strong> ${payload.location}</li>
      <li><strong>Time Submitted:</strong> ${new Date().toLocaleString()}</li>
    </ul>
    
    <h2>User Details:</h2>
    <ul>
      <li><strong>Name:</strong> ${payload.user?.firstName} ${payload.user?.lastName}</li>
      <li><strong>Phone:</strong> ${payload.user?.phoneNumber || 'Not provided'}</li>
    </ul>
    
    <p>A driver in distress is counting on professionals like you. Your quick response can make a significant difference in their day.</p>
    
    <p>To view full details and accept this request, please click the button below:</p>
    <p><a href="${payload.viewRequestLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">View and Accept Request</a></p>
    
    <p><em>Remember, fast response times lead to higher ratings and more business opportunities!</em></p>
    
    <p>If you have any questions or need additional information, don't hesitate to contact our support team.</p>
    
    <p>Thank you for your dedication to helping drivers in need.</p>
    
    <p>Best regards,<br>Your Breakdown Assistance Team</p>
  `,
});