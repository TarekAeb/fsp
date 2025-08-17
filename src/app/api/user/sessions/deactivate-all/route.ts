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

    // Get current session ID
    const currentSessionId = (session as any).sessionId

    if (!currentSessionId) {
      return NextResponse.json(
        { error: "Current session not found" },
        { status: 400 }
      )
    }

    // Delete all other sessions
    const deletedCount = await SessionStore.deleteOtherSessions(
      session.user.id,
      currentSessionId
    )

    return NextResponse.json({
      message: `Successfully deactivated ${deletedCount} other sessions`,
      deactivatedCount: deletedCount
    })
  } catch (error) {
    console.error("Deactivate all sessions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}