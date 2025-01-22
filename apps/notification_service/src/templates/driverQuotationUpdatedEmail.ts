import {
  DriverQuotationUpdatedPayload,
  notificationIcons,
} from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverQuotationUpdatedEmail = (
  payload: DriverQuotationUpdatedPayload,
) => {
  const content = `
    <p>Hi ${payload?.user?.firstName ?? ""},</p>
    <p>Good news! A driver updated a quotation for your assistance request.</p>
    <h2>Quotation details:</h2>
    <ul>
    <li><strong>Reference Id:</strong> ${payload.breakdownRequestId}</li>
      <li><strong>Estimated cost:</strong> £${payload.estimation}</li>
      <li><strong>Driver comment:</strong> ${payload?.explanation??"-"}</li>
    </ul>
    <p>If this quotation looks good to you, please review and accept it. You can use inbuilt chat to directly contact the driver and further adjust the quotation. </p>
    <p> The sooner you accept, the quicker we can get you back on the road!<p>

     <p style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1B8B4B;">
      <strong>What is next:</strong><br>
     Once you accept the quotation, the driver will be notified. Upon the driver's confirmation, we will securely share your contact information with the driver and provide you with their contact details. </p>
    
  `;

  const htmlBody = createBaseTemplate({
    content,ctaLink: payload.viewRequestLink,ctaText:"View and Accept"
  });

  return {
    subject: `${notificationIcons.DRIVER_QUOTATION_UPDATED} Quotation updated by driver for your Request, Reference Id: ${payload.breakdownRequestId}`,
    htmlBody,
  };
};
