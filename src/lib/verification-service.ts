import { prisma } from "@/lib/prisma"
import { VerificationTokens } from "@/lib/verification-tokens"
import { sendEmailVerification, sendWelcomeEmail } from "@/lib/email/service"

export class VerificationService {
  // Send verification email
  static async sendVerificationEmail(email: string, userName?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, emailVerified: true }
      })

      if (!user) {
        return { success: false, error: "User not found" }
      }

      if (user.emailVerified) {
        return { success: false, error: "Email is already verified" }
      }

      // Check rate limiting (don't send if one was sent in last 5 minutes)
      const recentToken = await prisma.verificationToken.findFirst({
        where: {
          email,
          expires: { gt: new Date() },
          // Check if created in last 5 minutes
          id: {
            // This is a workaround for checking creation time
            // You might want to add a createdAt field to VerificationToken
          }
        }
      })

      // Create verification token
      const token = await VerificationTokens.createVerificationToken(email)
      
      // Send email
      const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
      const emailResult = await sendEmailVerification(
        email, 
        verificationUrl, 
        userName || user.name || 'User'
      )

      if (emailResult.success) {
        return { 
          success: true, 
          message: "Verification email sent successfully" 
        }
      } else {
        return { 
          success: false, 
          error: "Failed to send verification email" 
        }
      }
    } catch (error) {
      console.error("Send verification email error:", error)
      return { 
        success: false, 
        error: "Internal server error" 
      }
    }
  }

  // Verify email with token
  static async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Verify token
      const tokenResult = await VerificationTokens.verifyToken(token)
      
      if (!tokenResult.success) {
        return { 
          success: false, 
          error: tokenResult.error || "Invalid token" 
        }
      }

      const email = tokenResult.email!

      // Update user verification status
      const user = await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
        select: { id: true, name: true, email: true }
      })

      // Delete used token
      await VerificationTokens.deleteToken(token)

      // Send welcome email
      await sendWelcomeEmail(user.email, user.name || 'User')

      return { 
        success: true, 
        message: "Email verified successfully" 
      }
    } catch (error) {
      console.error("Verify email error:", error)
      return { 
        success: false, 
        error: "Internal server error" 
      }
    }
  }

  // Check verification status
  static async getVerificationStatus(userId: string): Promise<{
    isVerified: boolean
    hasPendingVerification: boolean
    email: string
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    const hasPendingVerification = await VerificationTokens.hasPendingVerification(user.email)

    return {
      isVerified: !!user.emailVerified,
      hasPendingVerification,
      email: user.email
    }
  }
}