import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Get top searched movies (you can implement a search_count field later)
    // For now, let's get the most recent movies as "top searched"
    const topMovies = await prisma.movie.findMany({
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
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    });

    return NextResponse.json({ movies: topMovies });
  } catch (error) {
    console.error("Top searched movies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}