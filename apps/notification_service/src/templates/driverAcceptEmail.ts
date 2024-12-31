import {
  BaseNotificationPayload,
  DriverNotificationPayload,
} from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverAcceptEmail = (payload: BaseNotificationPayload) => {
  const content = `
    <h1>🎉 Breakdown Assistance Request Accepted</h1>
    <p>Dear ${payload?.user?.firstName ?? "Valued Customer"},</p>
    <p style="font-weight: bold; font-size: 16px; color: #2C3E50;">
      ${payload?.driver?.firstName} has <span style="color: #27AE60;">ACCEPTED</span> your breakdown assistance request #${payload.breakdownRequestId}
    </p>
    
    <h2>Service Provider Details:</h2>
    <ul>
      <li><strong>Name:</strong> ${payload?.driver?.firstName}</li>
      <li><strong>Phone:</strong> ${payload?.driver?.phoneNumber}</li>
      <li><strong>Email:</strong> ${payload?.driver?.email}</li>
    </ul>
    
    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1B8B4B;">
      <strong>What is next:</strong><br>
      Use above contact details to get in touch with the driver to arrange the breakdown assistance.    </p>
    
    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View Request</a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      Note: Quick confirmation ensures faster assistance and better service coordination.
    </p>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Breakdown Assistance Request Accepted - Request #${payload.breakdownRequestId}`,
    htmlBody,
  };
};
