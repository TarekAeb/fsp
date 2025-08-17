import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('id');

    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
    }

    // Get current movie to find similar movies
    const currentMovie = await db
      .selectFrom('Movie')
      .selectAll()
      .where('id', '=', parseInt(movieId))
      .executeTakeFirst();

    if (!currentMovie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Get recommended movies (same genre, excluding current movie)
    const recommendedMovies = await db
      .selectFrom('Movie')
      .innerJoin('MovieGenre', 'Movie.id', 'MovieGenre.movieId')
      .innerJoin('MovieGenre as CurrentMovieGenre', 'MovieGenre.genreId', 'CurrentMovieGenre.genreId')
      .selectAll('Movie')
      .where('CurrentMovieGenre.movieId', '=', parseInt(movieId))
      .where('Movie.id', '!=', parseInt(movieId))
      .orderBy('Movie.rating', 'desc')
      .limit(6)
      .execute();

    return NextResponse.json(recommendedMovies);
  } catch (error) {
    console.error("Error fetching recommended movies:", error);
    return NextResponse.json({ error: "Failed to fetch recommended movies" }, { status: 500 });
  }
}