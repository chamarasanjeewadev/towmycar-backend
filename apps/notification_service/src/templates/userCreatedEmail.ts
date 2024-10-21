
export const userCreatedEmail = (payload: any) => ({
  subject: `Welcome to Our Service, ${payload.firstName}!`,
  textBody: `Hello ${payload.firstName},

Welcome to our breakdown assistance service! Your account has been successfully created.

Email: ${payload.email}

You can now log in to your account and request assistance whenever you need it.

Best regards,
Your Company`,
  htmlBody: `
    <h1>Welcome to Our Service!</h1>
    <p>Hello ${payload.firstName},</p>
    <p>Welcome to our breakdown assistance service! Your account has been successfully created.</p>
    <p>Email: ${payload.email}</p>
    <p>You can now log in to your account and request assistance whenever you need it.</p>
    <p>Best regards,<br>Your Company</p>
  `,
});