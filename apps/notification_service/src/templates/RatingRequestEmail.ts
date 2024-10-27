import { EmailPayloadBaseType, EmailPayloadType } from "@towmycar/common";

interface RatingRequestEmailProps {
  requestId: number;
  link: string;
}

// Replace this with your actual S3 or CDN URL
const LOGO_URL = "https://your-s3-bucket.s3.amazonaws.com/towMyCarLogo.svg";

export function RatingRequestEmail({
  requestId,
  link,
}: RatingRequestEmailProps): Partial<EmailPayloadType> {
  const subject = "Rate Your TowMyCar Experience";

  const textBody = `
Dear valued customer,

We hope your recent towing experience with TowMyCar (Request ID: ${requestId}) met your expectations. Your feedback is crucial in helping us improve our services.

We'd greatly appreciate it if you could take a moment to rate your experience and provide any additional comments. Please visit the following link to rate your experience:

${link}

Your input helps us ensure we're providing the best possible service to all our customers.

Thank you for choosing TowMyCar!

© 2024 TowMyCar.uk - All rights reserved

If you have any questions, please contact our support team at support@towmycar.uk
  `;

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .logo {
          width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .container {
          background-color: #f8f8f8;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #1a73e8;
          margin-top: 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #1a73e8;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${LOGO_URL}" alt="TowMyCar Logo" class="logo">
        <h1>${subject}</h1>
        <p>Dear valued customer,</p>
        <p>We hope your recent towing experience with TowMyCar (Request ID: ${requestId}) met your expectations. Your feedback is crucial in helping us improve our services.</p>
        <p>We'd greatly appreciate it if you could take a moment to rate your experience and provide any additional comments.</p>
        <a href="${link}" class="cta-button">Rate Your Experience</a>
        <p>Your input helps us ensure we're providing the best possible service to all our customers.</p>
        <p>Thank you for choosing TowMyCar!</p>
        <div class="footer">
          <p>© 2024 TowMyCar.uk - All rights reserved</p>
          <p>If you have any questions, please contact our support team at support@towmycar.uk</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject,
    textBody,
    htmlBody,
  };
}
