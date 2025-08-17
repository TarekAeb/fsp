import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMovie } from "@/server/service/admin";
import { db } from "@/server/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create a proper MovieData object
    const movieData = {
      title: body.title,
      releaseDate: body.releaseDate,
      durationMinutes: body.durationMinutes,
      rating: body.rating,
      description: body.description,
      language: body.language,
      posterUrl: body.posterUrl,
      budget: body.budget || null,
      boxOffice: body.boxOffice || null,
      trailerUrl: body.trailerUrl || null,
      genres: body.genres || [],
      directors: body.directors || [],
      cast: body.cast || [],
      type: body.type || "short_movie",
    };

    const response = await createMovie(movieData);

    if (response) {
      return NextResponse.json(
        { message: "Movie created successfully", id: response.id },
        { status: 201 }
      );
    } else {
      throw new Error("No response from createMovie function");
    }
  } catch (error) {
    console.error("Error creating movie:", error);
    return NextResponse.json(
      { error: "Failed to create movie" },
      { status: 500 }
    );
  }
}

const ALLOWED_TYPES = ["short_movie", "documentary", "animation"] as const;
type MovieType = (typeof ALLOWED_TYPES)[number];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = db
      .selectFrom("Movie")
      .selectAll()
      .orderBy("releaseDate", "desc");

    // Only add the filter if type is valid
    if (type && ALLOWED_TYPES.includes(type as MovieType)) {
      query = query.where("type", "=", type as MovieType); // <-- cast to enum type
    }

    const movies = await query.execute();

    // For each movie, fetch its relationships
    const moviesWithRelations = await Promise.all(
      movies.map(async (movie) => {
        // Get genres
        const genres = await db
          .selectFrom("Genre")
          .innerJoin("MovieGenre", "Genre.id", "MovieGenre.genreId")
          .where("MovieGenre.movieId", "=", movie.id)
          .select(["Genre.id", "Genre.name"])
          .execute();

        // Get directors
        const directors = await db
          .selectFrom("Director")
          .innerJoin("MovieDirector", "Director.id", "MovieDirector.directorId")
          .where("MovieDirector.movieId", "=", movie.id)
          .select(["Director.id", "Director.name"])
          .execute();

        // Get cast with actor details
        const cast = await db
          .selectFrom("MovieCast")
          .innerJoin("Actor", "Actor.id", "MovieCast.actorId")
          .where("MovieCast.movieId", "=", movie.id)
          .select([
            "MovieCast.actorId",
            "MovieCast.roleName",
            "Actor.name as actorName",
          ])
          .execute();

        // Add these to the movie object
        return {
          ...movie,
          genres,
          directors,
          cast: cast.map((c) => ({
            actorId: c.actorId,
            roleName: c.roleName,
            actor: { id: c.actorId, name: c.actorName },
          })),
        };
      })
    );

    return NextResponse.json(moviesWithRelations);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
