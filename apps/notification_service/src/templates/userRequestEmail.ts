import { createBaseTemplate } from "./baseTemplate";

interface UserRequestEmailPayload {
  firstName?: string;
  breakdownRequestId?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  viewRequestLink?: string;
}

export const userRequestEmail = (payload: any) => {
  const content = `
    <h1>We're Here to Help with Your Breakdown</h1>
    <p>Dear ${payload.firstName ?? "Valued Customer"},</p>
    <p>We're sorry to hear that you're experiencing car trouble. We understand how stressful and inconvenient this situation can be, and we want you to know that help is on the way.</p>
    <p>Your breakdown request #${
      payload.breakdownRequestId ?? "N/A"
    } has been successfully submitted and is being processed. We're working quickly to find a nearby driver to assist you.</p>
    
    <h2>Here's what you need to know:</h2>
    <ul>
      <li>Your location: ${
        payload.userLocation
          ? `${payload.userLocation.latitude}, ${payload.userLocation.longitude}`
          : "N/A"
      }</li>
      <li>Request ID: #${payload.breakdownRequestId ?? "N/A"}</li>
      <li>Status: We're searching for a driver</li>
    </ul>
    
    <p>We'll notify you as soon as a driver accepts your request. In the meantime, please ensure you're in a safe location, preferably away from traffic.</p>
    <p><strong>If you need immediate emergency assistance, please don't hesitate to call 999.</strong></p>
    <p>Stay safe, and we'll have you back on the road as soon as possible.</p>

    <div style="text-align: center;">
      <a href="${
        payload.viewRequestLink ?? "#"
      }" class="button">View Request Status</a>
    </div>
  `;

  const htmlBody = createBaseTemplate({ content });

  return {
    subject: `We're here to help with your breakdown - Request #${
      payload.breakdownRequestId ?? "N/A"
    }`,
    htmlBody,
  };
};
