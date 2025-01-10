import { createBaseTemplate } from "./baseTemplate";

export const userAcceptEmail = (payload: any) => {
  const content = `
    <h1>Quotation Accepted - Action Required</h1>
    <p>Hi ${payload?.driver?.firstName ?? ","},</p>
    <p>Great news! Customer has accepted your quotation for breakdown assistance request, Reference Id: ${payload.requestId}.</p>
    
    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1B8B4B;">
      <strong>Next Steps:</strong><br>
      Please click the link below to confirm your participation and begin providing assistance. Your prompt response ensures the best service for our customers.
    </p>
    
    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">Confirm Participation</a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      Note: Quick confirmation helps maintain our service quality standards and customer satisfaction.
    </p>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `Action Required: Confirm Service for Request #${payload.requestId}`,
    htmlBody,
  };
};
