interface BaseTemplateProps {
  content: string;
  logoUrl?: string;
  subject?: string;
  from?: string;
  fromEmail?: string;
  to?: string;
  date?: string;
}

const DEFAULT_SOCIAL_LINKS = {
  instagram: "https://instagram.com/towmycar",
  facebook: "https://facebook.com/towmycar",
  linkedin: "https://linkedin.com/company/towmycar",
} as const;

export function createBaseTemplate({
  content,
  logoUrl = "https://towmycar.vercel.app/vercel.svg",
  subject = "",
  from = "",
  fromEmail = "",
  to = "",
  date = new Date().toLocaleString(),
}: BaseTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          background-color: #FFF7E6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .main-header {
          text-align: left;
          padding: 40px 0 20px;
        }
        .main-header a {
          text-decoration: none;
          color: #000000;
        }
        .main-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .content {
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          margin: 20px 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .content h2 {
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        .content p {
          color: #374151;
          margin-bottom: 16px;
        }
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
          text-align: center;
        }
        .social-links {
          text-align: center;
          padding: 32px 0;
        }
        .social-icon {
          display: inline-block;
          margin: 0 8px;
          width: 24px;
          height: 24px;
          opacity: 0.8;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
      </style>
    </head>
   <body style="background-color: #FFF7E6; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF7E6;">
    <tr>
      <td align="center" style="padding: 20px 0; background-color: #FFF7E6;">
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF7E6;">
          <tr>
            <td>
              <div class="main-header" style="background-color: #FFF7E6;">
                <a href="https://towmycar.vercel.app">
                  <h1 style="background-color: #FFF7E6;">TowMyCar</h1>
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <div class="content" style="background-color: white; padding: 40px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
    ${content}
  </div>
  <div class="social-links" style="background-color: #FFF7E6; text-align: center; padding: 32px 0;">
    ${Object.entries(DEFAULT_SOCIAL_LINKS)
      .map(([platform, url]) =>
        url
          ? `
        <a href="${url}" target="_blank">
          <img src="https://cdn-icons-png.flaticon.com/512/87/${
            platform === "instagram"
              ? "87390"
              : platform === "facebook"
              ? "87368"
              : "87400"
          }.png" 
               alt="${platform}" 
               class="social-icon">
        </a>
      `
          : ""
      )
      .join("")}
  </div>
  <div class="footer" style="background-color: #FFF7E6; text-align: center; padding: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
    <p>© ${new Date().getFullYear()} TowMyCar. All rights reserved.</p>
    <p>If you have any questions, please contact our support team at support@towmycar.com</p>
  </div>
</body>

    </html>
  `;
}
