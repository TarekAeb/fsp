import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current user to check if they have an image
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    })

    // If user has an image, try to delete the file
    if (user?.image && user.image.startsWith('/uploads/profiles/')) {
      try {
        const filepath = join(process.cwd(), 'public', user.image)
        await unlink(filepath)
      } catch (error) {
        // File might not exist, continue anyway
        console.log("Could not delete file:", error)
      }
    }

    // Update user's image to null in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    })

    return NextResponse.json({
      message: "Photo removed successfully"
    })
  } catch (error) {
    console.error("Remove photo error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}