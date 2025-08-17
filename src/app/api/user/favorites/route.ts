import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's favorite movies with movie details
    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            rating: true,
            durationMinutes: true,
            releaseDate: true,
            description: true,
            language: true,
            trailerUrl: true
          }
        }
      },
      orderBy: {
        addedAt: 'desc' // Most recently added first
      }
    })

    // Transform the data to match the Movie interface
    const savedMovies = favorites.map(favorite => ({
      id: favorite.movie.id,
      title: favorite.movie.title,
      posterUrl: favorite.movie.posterUrl,
      rating: favorite.movie.rating,
      durationMinutes: favorite.movie.durationMinutes,
      releaseDate: favorite.movie.releaseDate,
      description: favorite.movie.description,
      language: favorite.movie.language,
      trailerUrl: favorite.movie.trailerUrl,
      addedAt: favorite.addedAt
    }))

    return NextResponse.json({
      movies: savedMovies,
      count: savedMovies.length
    })
  } catch (error) {
    console.error("Fetch favorites error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}