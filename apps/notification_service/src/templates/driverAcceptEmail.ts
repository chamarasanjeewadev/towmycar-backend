import {
  BaseNotificationPayload,
  COLORS,
  DriverAcceptPayload,
  notificationIcons,
} from "@towmycar/common";
import { createBaseTemplate } from "./baseTemplate";

export const driverAcceptEmail = (payload: DriverAcceptPayload) => {
  const content = `
    <p>Dear ${payload?.user?.firstName ?? "Valued Customer"},</p>
    <p style="font-weight: bold;  color: #2C3E50;">
     We are pleased to inform you that your assistance request has been <span style="color: ${COLORS.textGreen}">ACCEPTED</span> by the driver <span style="color: ${COLORS.textGreen}">${payload?.driver?.firstName}</span>
    </p>
    
    <h3>More details:</h3>
    <ul>
    <li><strong>Reference Id:</strong> ${payload.breakdownRequestId}</li>
    ${payload?.driver?.firstName && ` <li><strong>Name:</strong> ${payload?.driver?.firstName} ${payload?.driver?.lastName??""}</li>`}  
      <li><strong>Phone:</strong> ${payload?.driver?.phoneNumber}</li>
      <li><strong>Email:</strong> ${payload?.driver?.email}</li>
      <li><strong>Tow truck no:</strong> ${payload?.vehicleNo}</li>
    </ul>
    
    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1B8B4B;">
      <strong>What is next:</strong><br>
     Please use the contact details provided above to coordinate directly with the driver and finalize arrangements. </p>
    
 
  `;

  const htmlBody = createBaseTemplate({ content, ctaLink: payload.viewRequestLink });

  return {
    subject: `${notificationIcons.DRIVER_ACCEPTED} Driver accepted your Request - Reference Id:${payload.breakdownRequestId}`,
    htmlBody,
  };
};
