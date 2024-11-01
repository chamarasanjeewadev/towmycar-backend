interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

interface BaseTemplateProps {
  content: string;
  buttonText?: string;
  buttonLink?: string;
  socialLinks?: SocialLinks;
  logoUrl?: string;
}

export function createBaseTemplate({
  content,
  buttonText,
  buttonLink,
  socialLinks = {
    instagram: 'https://instagram.com/etsymil',
    facebook: 'https://facebook.com/etsymil',
    linkedin: 'https://linkedin.com/company/etsymil'
  },
  logoUrl = 'https://towmycar.vercel.app/vercel.svg'
}: BaseTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .social-links {
          text-align: center;
          padding: 20px 0;
        }
        .social-icon {
          display: inline-block;
          margin: 0 10px;
          width: 32px;
          height: 32px;
          background-color: #6b7280;
          border-radius: 50%;
          padding: 8px;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Company Logo" class="logo">
        </div>
        <div class="content">
          ${content}
          ${buttonText && buttonLink ? `
            <div style="text-align: center;">
              <a href="${buttonLink}" class="button">${buttonText}</a>
            </div>
          ` : ''}
        </div>
        <div class="social-links">
          ${socialLinks.instagram ? `
            <a href="${socialLinks.instagram}" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/512/87/87390.png" alt="Instagram" class="social-icon">
            </a>
          ` : ''}
          ${socialLinks.facebook ? `
            <a href="${socialLinks.facebook}" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/512/87/87368.png" alt="Facebook" class="social-icon">
            </a>
          ` : ''}
          ${socialLinks.linkedin ? `
            <a href="${socialLinks.linkedin}" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/512/87/87400.png" alt="LinkedIn" class="social-icon">
            </a>
          ` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          <p>If you have any questions, please contact our support team at support@company.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 