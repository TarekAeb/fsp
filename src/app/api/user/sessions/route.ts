import { NextRequest, NextResponse } from "next/server";
import authConfig from "@/auth";
import { getServerSession } from "next-auth";
import { SessionStore } from "@/lib/session-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active sessions for the user
    const sessions = await SessionStore.getUserSessions(session.user.id);

    // Get current session ID from the session
    const currentSessionId = (session as { sessionId?: string }).sessionId;

    const sessionsWithStatus = sessions.map((s) => ({
      id: s.sessionId,
      sessionToken: `...${s.sessionId.slice(-8)}`, // Show only last 8 chars for security
      expires: s.expiresAt,
      createdAt: s.createdAt,
      updatedAt: s.lastActivity,
      isCurrent: s.sessionId === currentSessionId,
    }));

    return NextResponse.json({
      sessions: sessionsWithStatus,
      totalActive: sessions.length,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
