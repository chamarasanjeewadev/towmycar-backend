import { BaseNotificationPayload, DriverNotificationPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverAcceptEmail = (payload: BaseNotificationPayload) => {
  const content = `
    <h1>Great news! A driver is willing to assist you</h1>
    <p>Hello ${payload?.user?.firstName},</p>
    <p>Great news! A driver has reviewed your breakdown request #${payload.breakdownRequestId} and is willing to assist you.</p>
    
    <h2>Driver Details:</h2>
    <ul>
      <li><strong>Name:</strong> ${payload?.driver?.firstName}</li>
      <li><strong>Phone:</strong> ${payload?.driver?.phoneNumber}</li>
      <li><strong>Email:</strong> ${payload?.driver?.email}</li>
    </ul>
    
    <p>To proceed with the service, please review and accept the quotation provided by the driver. Once you accept, the driver will be on their way to assist you.</p>
    <p>If you have any questions about the quotation or need further information, don't hesitate to reach out to us or directly to the driver.</p>
    <p>We're looking forward to getting you back on the road soon!</p>

    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View Request and Accept Quotation</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Great news! A driver is willing to assist you - Request #${payload.breakdownRequestId}`,
    htmlBody,
  };
};