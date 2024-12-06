import { createBaseTemplate } from "./baseTemplate";

export const userRejectedEmail = (payload: any) => {
  const content = `
    <h1>User Rejected Your Quotation</h1>
    <p>Hello,</p>
    <p>The user has rejected your quotation for request #${payload.requestId}. Please proceed with the service.</p>

    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View Request</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `User Accepted Quotation for Request #${payload.requestId}`,
    htmlBody,
  };
};