import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export interface SessionData {
  userId: string
  sessionId: string
  userAgent?: string
  ipAddress?: string
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
  rememberMe?: boolean
}

export class SessionStore {
  // Create a new session record
  static async createSession(data: {
    userId: string
    userAgent?: string
    ipAddress?: string
    expiresAt?: Date
    rememberMe?: boolean
  }): Promise<string> {
    const sessionId = crypto.randomUUID()
    const expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours

    await prisma.session.create({
      data: {
        sessionToken: sessionId,
        userId: data.userId,
        expires: expiresAt,
        // You can store additional metadata here if your schema supports it
      }
    })

    console.log(`Session created: ${sessionId}, expires: ${expiresAt.toISOString()}, rememberMe: ${data.rememberMe}`)
    return sessionId
  }

  // Get all active sessions for a user with remember me info
  static async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: {
          gt: new Date()
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return sessions.map(session => {
      // Determine if this was a "remember me" session based on duration
      const sessionDuration = session.expires.getTime() - session.createdAt.getTime()
      const isRememberMe = sessionDuration > (25 * 60 * 60 * 1000) // More than 25 hours = remember me
      
      return {
        userId: session.userId,
        sessionId: session.sessionToken,
        createdAt: session.createdAt,
        lastActivity: session.updatedAt,
        expiresAt: session.expires,
        rememberMe: isRememberMe,
      }
    })
  }

  // Update session activity
  static async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await prisma.session.update({
        where: { sessionToken: sessionId },
        data: { updatedAt: new Date() }
      })
    } catch (error) {
      console.log("Session not found for activity update:", sessionId)
    }
  }

  // Delete a specific session
  static async deleteSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { sessionToken: sessionId }
    })
  }

  // Delete all sessions for a user except current
  static async deleteOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        sessionToken: {
          not: currentSessionId
        }
      }
    })
    return result.count
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    return result.count
  }

  // Get session by ID
  static async getSession(sessionId: string): Promise<SessionData | null> {
    const session = await prisma.session.findUnique({
      where: { 
        sessionToken: sessionId,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!session) return null

    // Determine if this was a "remember me" session
    const sessionDuration = session.expires.getTime() - session.createdAt.getTime()
    const isRememberMe = sessionDuration > (25 * 60 * 60 * 1000)

    return {
      userId: session.userId,
      sessionId: session.sessionToken,
      createdAt: session.createdAt,
      lastActivity: session.updatedAt,
      expiresAt: session.expires,
      rememberMe: isRememberMe,
    }
  }
}