import { COLORS } from "@towmycar/common";

interface BaseTemplateProps {
  content: string;
  logoUrl?: string;
  subject?: string;
  from?: string;
  fromEmail?: string;
  to?: string;
  date?: string;
  ctaLink?: string;
  ctaText?: string;
}

export function createBaseTemplate({
  content,
  logoUrl = `${process.env.VIEW_REQUEST_BASE_URL ?? ""}/towmycarlogo-landing.png`,
  subject = "",
  from = "",
  fromEmail = "",
  to = "",
  date = new Date().toLocaleString(),
  ctaLink = "",
  ctaText = "View Request",
}: BaseTemplateProps): string {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, ${COLORS.primary}, ${
        COLORS.secondary
      });
      font-family: Arial, sans-serif;
      color: ${COLORS.text};
    }
    table {
      border-spacing: 0;
      margin: 0 auto;
    }
    img {
      border: 0;
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    a {
      text-decoration: none;
      color: inherit;
    }
    .button {
      display: inline-block;
      background-color: ${COLORS.primary};
      color: ${COLORS.white} !important;
      border: 1px solid ${COLORS.secondary};
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 25px;
      text-transform: uppercase;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      margin-top: 20px;
      transition: background-color 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      letter-spacing: 0.5px;
    }
   .button:hover {
  background-color: ${COLORS.primary};
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  opacity: 0.9; /* Reduces opacity slightly */
}
    .social-icon {
      padding: 0 8px;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .social-icon:hover {
      transform: scale(1.1);
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <!-- Main Table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <!-- Content Wrapper -->
        <table role="presentation" width="600" style="max-width: 600px; background-color: ${
          COLORS.white
        }; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 12px; background-color: ${COLORS.primary};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="80" style="vertical-align: middle;">
                    <img src="${logoUrl}" alt="TowMyCar Logo" width="80" style="margin: 0;" />
                  </td>
                  <td style="vertical-align: middle; text-align: center; padding-right: 80px;">
                    <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 600;">TowMyCar</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content----------------->
          <tr style="padding: 12px; background-color: ${COLORS.lightgray};">
            <td style="padding: 20px; font-size: 16px; line-height: 1.6; color: ${
              COLORS.text
            };">
              
              ${content}
              <p>If you have any questions or require further support, feel free to contact us at support@towmycar.uk.</p>
             <p>Thank you for choosing TowMyCar!</p>
    <div style="text-align: center;">
      <a href="${ctaLink}" class="button">${ctaText}</a>
    </div> 
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; font-size: 14px; line-height: 1.5; background-color: ${
              COLORS.primary
            }; color: ${COLORS.white};">
              <p style="margin: 0;">© ${new Date().getFullYear()} TowMyCar. All rights reserved.</p>
              <p style="margin: 0;">
                Need help? Contact our support team at 
                <a href="mailto:support@towmycar.uk" style="color: ${
                  COLORS.white
                }; text-decoration: underline;">
                  support@towmycar.uk
                </a>
              </p>
              <p style="margin-top: 10px;">
      
    </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

  `;
}
// <a href="https://${process.env.VIEW_REQUEST_BASE_URL}/admin/unsubscribe?email=${encodeURIComponent(to)}" 
//          style="color: ${COLORS.white}; text-decoration: underline;">
//         unsubscribe
//       </a>