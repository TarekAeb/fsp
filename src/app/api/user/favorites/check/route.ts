import { NextRequest, NextResponse } from "next/server"
import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.id) {
      return NextResponse.json({ isSaved: false })
    }

    const { searchParams } = new URL(req.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      )
    }

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_movieId: {
          userId: session.user.id,
          movieId: parseInt(movieId)
        }
      }
    })

    return NextResponse.json({
      isSaved: !!favorite
    })
  } catch (error) {
    console.error("Check favorite error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}