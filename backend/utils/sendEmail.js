import nodemailer from "nodemailer";

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // Use transport mode based on SMTP port to avoid TLS mismatch errors:
  // 465 => implicit TLS (secure true), 587 => STARTTLS (secure false).
  const secure = port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and optional SMTP_FROM in backend .env",
    );
  }

  const auth = { user, pass };
  const isGmailHost = host.toLowerCase().includes("smtp.gmail.com");

  if (isGmailHost) {
    return nodemailer.createTransport({
      service: "gmail",
      auth,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth,
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
