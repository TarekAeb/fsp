import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current session token to preserve it
    const currentSessionToken = req.cookies.get('next-auth.session-token')?.value || 
                               req.cookies.get('__Secure-next-auth.session-token')?.value

    if (!currentSessionToken) {
      return NextResponse.json(
        { error: "Current session not found" },
        { status: 400 }
      )
    }

    // Delete all sessions EXCEPT the current one
    const result = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        sessionToken: {
          not: currentSessionToken
        }
      }
    })

    return NextResponse.json({
      message: `Successfully deactivated ${result.count} other sessions`,
      deactivatedCount: result.count
    })
  } catch (error) {
    console.error("Deactivate sessions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}