import { AdminApprovalRequestPayload, DriverCreatedAdminNotificationPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverCreatedAdminNotificationEmail = (
  payload: DriverCreatedAdminNotificationPayload,
) => {
  const content = `
    <h1>New Driver Registration Notification</h1>
    <p>Hello Admin,</p>
    <p>A new driver has registered .</p>
    
    <h2>Driver Details:</h2>
    <ul>
      <li><strong>Role:</strong> ${payload?.userInfo?.role || 'N/A'} </li>
      <li><strong>ID:</strong> ${payload?.userInfo?.customerId || payload?.userInfo?.driverId?.toString()}</li>
    </ul>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `New User Registration - Notification: ${payload?.userInfo?.role }`,
    htmlBody,
  };
};
