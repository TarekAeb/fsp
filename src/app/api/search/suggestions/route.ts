import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get movie titles and genres for suggestions
    const [movieTitles, genres] = await Promise.all([
      prisma.movie.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          title: true
        },
        take: 5
      }),
      prisma.genre.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          name: true
        },
        take: 3
      })
    ]);

    const suggestions = [
      ...movieTitles.map(movie => ({ text: movie.title, type: 'movie' })),
      ...genres.map(genre => ({ text: genre.name, type: 'genre' }))
    ];

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}