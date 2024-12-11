import {
  DriverNotificationPayload,
  formatDate,
} from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export function driverNotificationEmail(payload: DriverNotificationPayload) {
  const content = `
    <h1>New Breakdown Request: Your Assistance Needed!</h1>
    <p>Hello ${payload.driver.firstName},</p>
    <p>We have an <strong>urgent breakdown request</strong> in your area that needs your expertise!</p>
    
    <h2>Request Details:</h2>
    <ul>
      <li><strong>Request ID:</strong> #${payload.breakdownRequestId}</li>
      ${
        payload.googleMapsLink
          ? `<li><strong>Location:</strong> <a href="${payload.googleMapsLink}" target="_blank">View on Google Maps</a></li>`
          : ""
      }
      <li><strong>Time Submitted:</strong> ${formatDate(
        payload.createdAt
      )} </li>
    </ul>
    
    <h2>User Details:</h2>
    <ul>
      ${
        payload.user && payload.user.firstName && payload.user.lastName
          ? `<li><strong>Name:</strong> ${payload.user.firstName} ${payload.user.lastName}</li>`
          : ""
      }
    </ul>
    
    <p>A driver in distress is counting on professionals like you. Your quick response can make a significant difference in their day.</p>
    
    <p><em>Remember, fast response times lead to higher ratings and more business opportunities!</em></p>
    
    <p>If you have any questions or need additional information, don't hesitate to contact our support team.</p>
    
    <p>Thank you for your dedication to helping drivers in need.</p>

    <div style="text-align: center;">
      <a href="${
        payload.viewRequestLink
      }" class="button">View and Accept Request</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({
    content,
  });

  return {
    subject: `New Breakdown Request: Your Assistance Needed! - Request #${payload.breakdownRequestId}`,
    htmlBody,
  };
}
