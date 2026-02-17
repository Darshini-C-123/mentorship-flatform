// Optional dependency: load at runtime so build succeeds even if nodemailer isn't installed (e.g. after ENOSPC during npm install).
function getTransporter(): import('nodemailer').Transporter | null {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    return null
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require('nodemailer') as typeof import('nodemailer')
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    })
  } catch (e) {
    console.warn('[email] nodemailer not installed. Run: npm install nodemailer', e)
    return null
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Skipping send.')
    return false
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com'
  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'Reset your password – Peer Peer Study',
      text: `You requested a password reset. Open this link to set a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Reset your password</a> (valid for 1 hour).</p>
        <p>If you did not request this, ignore this email.</p>
      `.trim(),
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send password reset:', err)
    return false
  }
}
