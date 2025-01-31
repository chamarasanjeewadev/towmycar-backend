import { AdminApprovalRequestPayload, DriverCreatedAdminNotificationPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverCreatedAdminNotificationEmail = (
  payload: DriverCreatedAdminNotificationPayload,
) => {
  const content = `
    <h1>New Driver Registration Notification</h1>
    <p>Hello Admin,</p>
    <p>A new driver has registered and requires your approval.</p>
    
    <h2>Driver Details:</h2>
    <ul>
      <li><strong>Full Name:</strong> ${payload.driver.firstName} ${payload.driver.lastName}</li>
      <li><strong>User ID:</strong> ${payload.driver.userId}</li>
      <li><strong>Email:</strong> ${payload.driver.email || 'Not provided'}</li>
      <li><strong>Phone:</strong> ${payload.driver.phoneNumber || 'Not provided'}</li>
    </ul>

  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `New Driver Registration - Notification: ${payload.driver.firstName} ${payload.driver.lastName}`,
    htmlBody,
  };
};
