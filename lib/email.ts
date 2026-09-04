import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #030305; color: #e8e4dc; font-family: 'Georgia', serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
    .logo { font-size: 22px; letter-spacing: 0.2em; color: #c8a96e; margin-bottom: 40px; }
    .logo span { color: #e8e4dc; }
    .card { border: 1px solid #1a1a2e; background: #0a0a14; padding: 40px; border-radius: 2px; }
    h1 { font-size: 24px; font-weight: 400; margin-bottom: 16px; color: #e8e4dc; letter-spacing: 0.05em; }
    p { font-size: 15px; line-height: 1.7; color: #8b8878; margin-bottom: 16px; }
    .btn { display: inline-block; background: #c8a96e; color: #030305; padding: 14px 32px; text-decoration: none; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; margin: 24px 0; }
    .footer { margin-top: 32px; font-size: 12px; color: #4a4840; }
    .divider { border: none; border-top: 1px solid #1a1a2e; margin: 32px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">MULTI<span>VERSE</span>.io</div>
    <div class="card">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} Multiverse.io — Infinite stories, infinite worlds.</div>
  </div>
</body>
</html>
`;

export async function sendActivationEmail(email: string, username: string, token: string) {
  const activationUrl = `${APP_URL}/auth/activate?token=${token}`;

  await transporter.sendMail({
    from: `"Multiverse.io" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Activate your Multiverse.io account',
    html: baseTemplate(`
      <h1>Welcome, ${username}.</h1>
      <p>Your universe awaits. Activate your account to start creating and exploring infinite stories across parallel worlds.</p>
      <a href="${activationUrl}" class="btn">Activate Account</a>
      <hr class="divider">
      <p>This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, username: string, token: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Multiverse.io" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Reset your Multiverse.io password',
    html: baseTemplate(`
      <h1>Password Reset</h1>
      <p>Hi ${username}, we received a request to reset your password. Click below to choose a new one.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <hr class="divider">
      <p>This link expires in 24 hours. If you didn't request a reset, your account is safe — no changes were made.</p>
    `),
  });
}

export async function sendWelcomeEmail(email: string, username: string) {
  await transporter.sendMail({
    from: `"Multiverse.io" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your universe is ready — Multiverse.io',
    html: baseTemplate(`
      <h1>Your universe is live.</h1>
      <p>Welcome to Multiverse.io, ${username}. You now have access to infinite stories across infinite worlds.</p>
      <p>Start reading curated tales, or become a writer and shape entire universes with branching narratives and alternate endings.</p>
      <a href="${APP_URL}/explore" class="btn">Explore Stories</a>
    `),
  });
}
