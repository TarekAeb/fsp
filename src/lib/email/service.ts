import { transporter } from './config'
import { emailTemplates } from './templates'
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    })

    console.log('✅ Email sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, userName: string) {
  const template = emailTemplates.passwordReset(resetUrl, userName)
  return sendEmail({
    to: email,
    ...template
  })
}

export async function sendEmailVerification(email: string, verificationUrl: string, userName: string) {
  const template = emailTemplates.emailVerification(verificationUrl, userName)
  return sendEmail({
    to: email,
    ...template
  })
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const template = emailTemplates.welcomeEmail(userName)
  return sendEmail({
    to: email,
    ...template
  })
}