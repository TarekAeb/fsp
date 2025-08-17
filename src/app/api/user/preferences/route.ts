import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const preferences = await req.json()

    // Here you would save preferences to your database
    // For now, we'll just return success
    
    return NextResponse.json({
      message: "Preferences updated successfully"
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}