import { createBaseTemplate } from "./baseTemplate";

export const driverAcceptEmail = (payload: any) => {
  const content = `
    <h1>Great news! A driver is willing to assist you</h1>
    <p>Hello ${payload.firstName},</p>
    <p>Great news! A driver has reviewed your breakdown request #${payload.requestId} and is willing to assist you.</p>
    
    <h2>Driver Details:</h2>
    <ul>
      <li><strong>Name:</strong> ${payload.driverName}</li>
      <li><strong>Phone:</strong> ${payload.driverPhone}</li>
      <li><strong>Email:</strong> ${payload.driverEmail}</li>
      <li><strong>Vehicle:</strong> ${payload.vehicleModel}</li>
      <li><strong>License Plate:</strong> ${payload.vehiclePlateNumber}</li>
      <li><strong>Estimated cost:</strong> ${payload.estimation}</li>
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
    subject: `Great news! A driver is willing to assist you - Request #${payload.requestId}`,
    htmlBody,
  };
};