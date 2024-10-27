import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  // Configure your email service here
});

export const EmailService = {
  sendRatingRequestEmail: async (customerEmail: string, ratingLink: string) => {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: 'Rate Your Breakdown Service Experience',
      html: `
        <h1>Rate Your Experience</h1>
        <p>Thank you for using our service. We'd appreciate your feedback.</p>
        <p>Please click the link below to rate your experience:</p>
        <a href="${ratingLink}">Rate Now</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  },
};
