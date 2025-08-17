import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { SessionStore } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Clean up expired sessions globally
    const cleanedCount = await SessionStore.cleanupExpiredSessions()

    return NextResponse.json({
      message: `Cleaned up ${cleanedCount} expired sessions`,
      cleanedCount: cleanedCount
    })
  } catch (error) {
    console.error("Session cleanup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}