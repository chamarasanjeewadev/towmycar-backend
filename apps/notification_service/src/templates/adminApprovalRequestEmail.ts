import { AdminApprovalRequestPayload, BaseNotificationPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const adminApprovalRequestEmail = (
  payload: AdminApprovalRequestPayload,
) => {
  const content = `
    <h1>Admin Approval Request</h1>
    <p>Hello,</p>
    <p>Driver ${payload.driver.firstName} ${payload.driver.lastName} has requested admin approval. Please review the request and approve or reject it.</p>
    <p>Request ID: ${payload.driver?.userId}</p>
    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View Request</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Admin Approval Request for Driver ${payload.driver.firstName} ${payload.driver.lastName}`,
    htmlBody,
  };
};
