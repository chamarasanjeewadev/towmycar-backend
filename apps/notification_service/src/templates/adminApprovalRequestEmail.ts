import { AdminApprovalRequestPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const adminApprovalRequestEmail = (
  payload: AdminApprovalRequestPayload,
) => {
  const content = `
    <h1>Admin Approval Request</h1>
    <p>Hello,</p>
    <p>Driver ${payload.driver.firstName} ${payload.driver.lastName} has requested admin approval. Please review the request and approve or reject it.</p>
    <p>${"User Id"}: ${payload.driver?.userId}</p>
   
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Admin Approval Request for Driver ${payload.driver.firstName} ${payload.driver.lastName}`,
    htmlBody,
  };
};
