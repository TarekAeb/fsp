import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { SessionStore } from "@/lib/session-store"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const params = await context.params
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { sessionId } = params
    const currentSessionId = (session as any).sessionId

    if (sessionId === currentSessionId) {
      return NextResponse.json(
        { error: "Cannot deactivate current session" },
        { status: 400 }
      )
    }

    // Verify the session belongs to the current user
    const sessionData = await SessionStore.getSession(sessionId)
    if (!sessionData || sessionData.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      )
    }

    // Delete the session
    await SessionStore.deleteSession(sessionId)

    return NextResponse.json({
      message: "Session deactivated successfully"
    })
  } catch (error) {
    console.error("Deactivate session error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}