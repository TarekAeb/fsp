import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { SessionStore } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { valid: false, error: "No session" },
        { status: 401 }
      )
    }

    // Check if database session exists
    const sessionId = (session as { sessionId?: string }).sessionId
    if (sessionId) {
      const dbSession = await SessionStore.getSession(sessionId)
      if (!dbSession) {
        return NextResponse.json(
          { valid: false, error: "Session deactivated" },
          { status: 401 }
        )
      }
      
      // Update session activity
      await SessionStore.updateSessionActivity(sessionId)
    }

    return NextResponse.json({
      valid: true,
      user: session.user
    })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json(
      { valid: false, error: "Session validation failed" },
      { status: 500 }
    )
  }
}