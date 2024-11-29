import { createBaseTemplate } from "./baseTemplate";

export const driverRejectEmail = (payload: any) => {
  const content = `
    <h1>Driver Rejected Your Request</h1>
    <p>Hello,</p>
    <p>Unfortunately, the driver has rejected your request #${payload.requestId}. We'll continue to look for another driver.</p>

    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View Request</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Driver Rejected Request #${payload.requestId}`,
    htmlBody,
  };
};