import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const checkUsernameSchema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = checkUsernameSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid username format" },
        { status: 400 }
      )
    }

    const { username } = validation.data

    // Check if username exists using the dedicated username field
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser 
        ? "Username is already taken" 
        : "Username is available"
    })
  } catch (error) {
    console.error("Username check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}