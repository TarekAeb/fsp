import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addFavoriteSchema = z.object({
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
    const { movieId } = addFavoriteSchema.parse(body)

    // Check if movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    })

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: movieId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Movie already in favorites" },
        { status: 400 }
      )
    }

    // Add to favorites
    await prisma.userFavorite.create({
      data: {
        userId: session.user.id,
        movieId: movieId
      }
    })

    return NextResponse.json({
      message: "Movie added to favorites successfully"
    })
  } catch (error) {
    console.error("Add favorite error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}