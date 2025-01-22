import { COLORS, DriverNotificationPayload, formatDate, notificationIcons } from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export function driverNotificationEmail(payload: DriverNotificationPayload) {
  const content = `
    <p>Hi ${payload?.driver?.firstName ?? ""},</p>
    <p>We have a new <strong>Assistance request </strong> in your area that needs your<span style="color: ${COLORS.textGreen}"> expertise!</span></p>
    
   <h3>More details:</h3>
    <ul>
    <li><strong>Reference Id:</strong> ${payload.breakdownRequestId}</li> 
      ${
        payload.googleMapsLink
          ? `<li><strong>Location:</strong> <a href="${payload.googleMapsLink}" target="_blank">View on Google Maps</a></li>`
          : ""
      }
      ${payload?.make && payload?.model?`<li><strong>Vehicle:</strong> ${payload?.make} ${payload?.model}</li>`:""   }
      <li><strong>Time Submitted:</strong> ${formatDate(
        payload.createdAt,
      )} </li>
    </ul>

    <p> Your quick response can make a significant difference in their day.</p>
    
    <p><em>Remember, fast response times lead to higher ratings and more business opportunities!</em></p>
   
  `;

  const htmlBody = createBaseTemplate({
    content,ctaLink: payload.viewRequestLink,ctaText:"View and Accept"
  });

  return {
    subject: `${notificationIcons.USER_REQUEST} New Assistance Request: Your Assistance Needed! - Reference Id: ${payload.breakdownRequestId}`,
    htmlBody,
  };
}
