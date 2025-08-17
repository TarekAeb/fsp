import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { SessionStore } from "@/lib/session-store"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get account statistics
    const [user, sessions, accounts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
      SessionStore.getUserSessions(session.user.id),
      prisma.account.findMany({
        where: { userId: session.user.id }
      })
    ])

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activeSessions: sessions.length,
      connectedAccounts: accounts.length,
    })
  } catch (error) {
    console.error("Get account stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}