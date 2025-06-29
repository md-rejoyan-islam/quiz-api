interface EmailOptions {
  to: string;
  subject: string;
  name: string;
}

import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export async function sendPasswordChangeConfirmationMail(
  options: EmailOptions
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: `
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';background-color:#1a1a2e;display:flex;justify-content:center;align-items:center;height:100vh"><div style="padding:20px"><table role="presentation" style="width:100%;max-width:600px;margin:20px auto;border-collapse:collapse"><tr style="background-color:#2a2a3e;border-radius:12px;display:block"><td style="padding:40px"><table role="presentation" style="width:100%;border-collapse:collapse;text-align:center"><tr><td><div style="width:60px;height:60px;margin:0 auto 20px;background-color:#28a745;border-radius:50%;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div></td></tr><tr><td><h1 style="color:#fff;margin:0 0 10px;font-size:28px;font-weight:600">Password Changed Successfully</h1></td></tr><tr><td><p style="color:#a9a9d4;margin:0 0 30px;font-size:16px;line-height:1.5">Hello ${options.name}, this email confirms that the password for your Quiz Master account has been changed.</p></td></tr><tr><td><p style="color:#a9a9d4;margin:30px 0 0;font-size:14px;line-height:1.5">If you did not make this change, please contact our support team immediately to secure your account.</p></td></tr></table></td></tr><tr><td style="padding:20px;text-align:center;background-color:#1a1a2e"><p style="color:#a9a9d4;font-size:12px;margin:0">© 2025 Quiz App. All rights reserved.</p></td></tr></table></div></body>
      `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email.");
  }
}
