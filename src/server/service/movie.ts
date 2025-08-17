import { db } from "@/server/database";

export const getMovieById = async (id: number) => {
    const movie = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl", "language", "durationMinutes", "releaseDate", "rating", "trailerUrl"])
        .where("Movie.id", "=", id)
        .execute();
    return movie;
};

export const getMovies = async () => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .execute();
    return movies;
};

export const getMoviesByLanguage = async (language: string) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where("Movie.language", "=", language)
        .execute();
    return movies;
};

export const getMoviesByRating = async (rating: number) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where("Movie.rating", "=", rating)
        .execute();
    return movies;
};

export const getMoviesByReleaseDate = async (releaseDate: string) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where("Movie.releaseDate", "=", new Date(releaseDate))
        .execute();
    return movies;
};

export const getMoviesByDuration = async (duration: number) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where("Movie.durationMinutes", "=", duration)
        .execute();
    return movies;
};

export const getMoviesByTitle = async (title: string) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where("Movie.title", "=", `%${title}%`)
        .execute();
    return movies;
};

export const getMoviesByDescription = async (description: string) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where("Movie.description", "=", `%${description}%`)
        .execute();
    return movies;
};

export const getMoviesByGenre = async (genre: string) => {
    const movies = await db
        .selectFrom("Movie")
        .innerJoin("MovieGenre", "Movie.id", "MovieGenre.movieId")
        .innerJoin("Genre", "MovieGenre.genreId", "Genre.id")
        .select(["Movie.id", "Movie.title", "Movie.description", "Movie.posterUrl"])
        .where("Genre.name", "=", genre)
        .execute();
    return movies;
}

export const getActorsByMovieId = async (movieId: number) => {
    const actors = await db
        .selectFrom("MovieCast")
        .innerJoin("Actor", "MovieCast.actorId", "Actor.id")
        .select(["Actor.id", "Actor.name", "MovieCast.roleName"])
        .where("MovieCast.movieId", "=", movieId)
        .execute();

    return actors;
}

export const getLastMovie = async () => {
    const movie = await db
        .selectFrom("Movie")
        .leftJoin("MovieGenre", "Movie.id", "MovieGenre.movieId")
        .leftJoin("Genre", "MovieGenre.genreId", "Genre.id")
        .select([
            "Movie.id",
            "Movie.title",
            "Movie.description",
            "Movie.posterUrl",
            "Movie.durationMinutes",
            "Movie.releaseDate",
            "Movie.rating",
            db.fn
                .agg<string[]>("array_agg", ["Genre.name"])
                .as("genres")
        ])
        .groupBy("Movie.id")
        .orderBy("Movie.id", "desc")
        .limit(1)
        .execute();

    return movie[0]; // Return a single movie object
};

export const getSearchMovies = async (query: string) => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "description", "posterUrl"])
        .where((eb) => eb.or([
            eb("Movie.title", "like", `%${query}%`),
            eb("Movie.description", "like", `%${query}%`)
        ]))
        .execute();
    return movies;
}