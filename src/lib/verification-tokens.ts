import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export class VerificationTokens {
  // Create a new verification token
  static async createVerificationToken(email: string): Promise<string> {
    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email }
    })

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      }
    })

    return token
  }

  // Verify a token
  static async verifyToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return { success: false, error: "Invalid token" }
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token }
      })
      return { success: false, error: "Token expired" }
    }

    return { success: true, email: verificationToken.email }
  }

  // Delete used token
  static async deleteToken(token: string): Promise<void> {
    await prisma.verificationToken.delete({
      where: { token }
    }).catch(() => {
      // Token might not exist, ignore error
    })
  }

  // Check if user has pending verification
  static async hasPendingVerification(email: string): Promise<boolean> {
    const token = await prisma.verificationToken.findFirst({
      where: {
        email,
        expires: { gt: new Date() }
      }
    })
    return !!token
  }

  // Clean up expired tokens
  static async cleanupExpired(): Promise<number> {
    const result = await prisma.verificationToken.deleteMany({
      where: {
        expires: { lt: new Date() }
      }
    })
    return result.count
  }
}