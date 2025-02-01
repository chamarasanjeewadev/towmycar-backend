import { AdminApprovalRequestPayload, ContactUsPayload, DriverCreatedAdminNotificationPayload } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const contactUsAdminNotificationEmail = (
  payload: ContactUsPayload,
) => {
  const content = `
  
    <p>Hello Admin,</p>
    <p>A new contact form has been submitted.</p>
    
    <h2>Contact Details:</h2>
    <ul>
      <li><strong>Name:</strong> ${payload?.firstName + ' ' + payload?.lastName || 'N/A'}</li>
      <li><strong>Email:</strong> ${payload?.email || 'N/A'}</li>
      <li><strong>Message:</strong> ${payload?.message || 'N/A'}</li>
    </ul>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `New Customer contact us message - ${payload?.email || 'No Subject'}`,
    htmlBody,
  };
};
