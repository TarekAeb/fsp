import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { getSavedMoviesByUserId } from "@/server/service/user"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const movies = await getSavedMoviesByUserId(session.user.id)

    if (!movies || movies.length === 0) {
      return NextResponse.json(
        { movies: [], message: 'No saved movies found' },
        { status: 200 }
      )
    }

    return NextResponse.json({ movies }, { status: 200 })
  } catch (error) {
    console.error("Error fetching saved movies:", error)
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}