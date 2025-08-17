import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const removeFavoriteSchema = z.object({
  movieId: z.number(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { movieId } = removeFavoriteSchema.parse(body)

    // Remove from favorites
    await prisma.userFavorite.delete({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId
        }
      }
    })

    return NextResponse.json({
      message: "Movie removed from favorites successfully"
    })
  } catch (error) {
    console.error("Remove favorite error:", error)
    
    // Handle case where favorite doesn't exist
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: "Movie not in favorites" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}