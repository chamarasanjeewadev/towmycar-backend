import { createBaseTemplate } from "./baseTemplate";

export const userCreatedEmail = (payload: any) => {
  const content = `
    <h1>Welcome to Our Service!</h1>
    <p>Hello ${payload?.firstName},</p>
    <p>Welcome to our breakdown assistance service! Your account has been successfully created.</p>
    <p>Email: ${payload.email}</p>
    <p>You can now log in to your account and request assistance whenever you need it.</p>
  `;

  const htmlBody = createBaseTemplate({
    content,
  });

  return {
    subject: `Welcome to Our Service, ${payload.firstName}!`,
    htmlBody,
  };
};