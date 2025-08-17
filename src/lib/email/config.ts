import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Verify connection configuration
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email server is ready to take our messages')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error)
    return false
  }
}