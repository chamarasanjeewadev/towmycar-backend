import { notificationIcons, QUOTATION_NO } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const userAcceptEmail = (payload: any) => {
  const content = `
    <p>Hi ${payload?.driver?.firstName ?? ","},</p>
    <p>Great news! Customer has accepted your quotation for breakdown assistance request.</p>
    <h2>More details:</h2>
    <ul>
    <li><strong>${QUOTATION_NO}:</strong> ${payload.requestId}</li>
    </ul> 
    <p>  Please click the link below to confirm your participation and begin providing assistance. Your prompt response ensures the best service for our customers.</p>
     <p style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1B8B4B;">
      <strong>What is next:</strong><br>
     Once you confirm the quotation, we will securely share your contact information with the customer and provide you with their contact details. Please call or text them to coordinate directly. </p>
    
    
    <div style="text-align: center;">
      <a href="${payload.viewRequestLink}" class="button">Confirm Participation</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content, ctaLink: payload.viewRequestLink, ctaText: "Confirm Participation" });

  return {
    subject: `${notificationIcons.USER_ACCEPTED} You won the job!!! : Confirm immedietly - ${QUOTATION_NO}: ${payload.requestId}`,
    htmlBody,
  };
};
