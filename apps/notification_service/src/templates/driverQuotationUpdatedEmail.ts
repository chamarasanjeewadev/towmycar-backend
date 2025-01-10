import {
  DriverAcceptedEventPayload,
  DriverQuotationUpdatedPayload,
} from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverQuotationUpdatedEmail = (
  payload: DriverQuotationUpdatedPayload,
) => {
  const content = `
    <h1>Quotation Updated by driver</h1>
    <p>Hi ${payload?.user?.firstName ?? ""},</p>
    <p>Good news! A driver updated a quotation for your breakdown request, Reference Id: ${payload.breakdownRequestId}.</p>
    <h2>Quotation details:</h2>
    <ul>
      <li><strong>Estimated cost:</strong> ${payload.estimation}</li>
    </ul>
    <p>If this quotation looks good to you, please review and accept it in our app. The sooner you accept, the quicker we can get you back on the road!</p>
    <p>If you have any questions, don't hesitate to reach out.</p>

    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">View and Accept Quotation</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({
    content,
  });

  return {
    subject: `Quotation updated by driver for your Request, Reference Id: ${payload.breakdownRequestId}`,
    htmlBody,
  };
};
