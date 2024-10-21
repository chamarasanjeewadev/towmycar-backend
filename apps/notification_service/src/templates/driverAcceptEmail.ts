
export const driverAcceptEmail = (payload: any) => ({
  subject: `Great news! A driver is willing to assist you - Request #${payload.requestId}`,
  textBody: `Hello ${payload.firstName},

Great news! A driver has reviewed your breakdown request #${payload.requestId} and is willing to assist you.

Driver Details:
Name: ${payload.driverName}
Phone: ${payload.driverPhone}
Email: ${payload.driverEmail}
Vehicle: ${payload.vehicleModel}
License Plate: ${payload.vehiclePlateNumber}
Estimated cost: ${payload.estimation}

To proceed with the service, please review and accept the quotation provided by the driver. Once you accept, the driver will be on their way to assist you.

Please click the link below to view your request, review the quotation, and confirm:

${payload.viewRequestLink}

If you have any questions about the quotation or need further information, don't hesitate to reach out to us or directly to the driver.

We're looking forward to getting you back on the road soon!

Best regards,
Your Breakdown Assistance Team`,
  htmlBody: `
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
    <p>Please click the button below to view your request, review the quotation, and confirm:</p>
    <p><a href="${payload.viewRequestLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">View Request and Accept Quotation</a></p>
    <p>If you have any questions about the quotation or need further information, don't hesitate to reach out to us or directly to the driver.</p>
    <p>We're looking forward to getting you back on the road soon!</p>
    <p>Best regards,<br>Your Breakdown Assistance Team</p>
  `,
});