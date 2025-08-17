import { db } from "@/server/database";

interface MovieData {
    title: string;
    releaseDate: Date;
    durationMinutes: number;
    rating: number;
    description: string;
    language: string;
    posterUrl: string;
    budget?: number;
    boxOffice?: number;
    trailerUrl?: string;
    genres?: number[]; // Array of genre IDs
    directors?: number[]; // Array of director IDs
    cast?: { actorId: number; roleName: string }[]; // Array of objects with actorId and roleName
    type: "short_movie" | "documentary" | "animation";
}

export const createMovie = async (movieData: MovieData): Promise<{ id: number }> => {
    const {
        title,
        releaseDate,
        durationMinutes,
        rating,
        description,
        language,
        posterUrl,
        budget,
        boxOffice,
        trailerUrl,
        genres,
        directors,
        cast,
        type
    } = movieData;

    // Insert the movie into the Movie table
    const [newMovie] = await db
        .insertInto("Movie")
        .values({
            title,
            releaseDate,
            durationMinutes,
            rating,
            description,
            language,
            posterUrl,
            budget,
            boxOffice,
            trailerUrl,
            type,
            updatedAt: new Date()
        })
        .returning("id") // Return the newly created movie ID
        .execute();

    // Handle genres, directors, and cast associations
    if (genres) {
        await Promise.all(genres.map(genreId => {
            return db
                .insertInto("MovieGenre")
                .values({ movieId: newMovie.id, genreId })
                .execute();
        }));
    }

    if (directors) {
        await Promise.all(directors.map(directorId => {
            return db
                .insertInto("MovieDirector")
                .values({ movieId: newMovie.id, directorId })
                .execute();
        }));
    }

    if (cast) {
        await Promise.all(cast.map(({ actorId, roleName }) => {
            return db
                .insertInto("MovieCast")
                .values({ movieId: newMovie.id, actorId, roleName })
                .execute();
        }));
    }

    return newMovie;
}


export const updateMovie = async (id: number, updatedData: MovieData): Promise<{ id: number }> => {
    const {
        title,
        releaseDate,
        durationMinutes,
        rating,
        description,
        language,
        posterUrl,
        budget,
        boxOffice,
        trailerUrl,
        genres,
        directors,
        cast,
        type
    } = updatedData;

    // Update the movie in the Movie table
    await db
        .updateTable("Movie")
        .set({
            title,
            releaseDate,
            durationMinutes,
            rating,
            description,
            language,
            posterUrl,
            budget,
            boxOffice,
            trailerUrl,
            type,
        })
        .where("id", "=", id)
        .execute();

    // Handle genres, directors, and cast associations
    if (genres) {
        // First, remove existing associations
        await db
            .deleteFrom("MovieGenre")
            .where("movieId", "=", id)
            .execute();

        // Then, add new associations
        await Promise.all(genres.map(genreId => {
            return db
                .insertInto("MovieGenre")
                .values({ movieId: id, genreId })
                .execute();
        }));
    }

    if (directors) {
        // First, remove existing associations
        await db
            .deleteFrom("MovieDirector")
            .where("movieId", "=", id)
            .execute();

        // Then, add new associations
        await Promise.all(directors.map(directorId => {
            return db
                .insertInto("MovieDirector")
                .values({ movieId: id, directorId })
                .execute();
        }));
    }

    if (cast) {
        // First, remove existing associations
        await db
            .deleteFrom("MovieCast")
            .where("movieId", "=", id)
            .execute();

        // Then, add new associations
        await Promise.all(cast.map(({ actorId, roleName }) => {
            return db
                .insertInto("MovieCast")
                .values({ movieId: id, actorId, roleName })
                .execute();
        }));
    }

    return { id }; // Return the updated movie ID
}

export const deleteMovie = async (id: number): Promise<void> => {
    // Delete the movie from the Movie table
    await db
        .deleteFrom("Movie")
        .where("id", "=", id)
        .execute();
}

export const createDirector = async (name: string, nationality: string, dateBirth: string, photoUrl: string): Promise<{ id: number }> => {
    const [newDirector] = await db
        .insertInto("Director")
        .values({ name, nationality, dateBirth: new Date(dateBirth), photoUrl })
        .returning("id")
        .execute();

    return newDirector;
}

export const updateDirector = async (id: number, name: string, nationality: string, birthDate: string, photoUrl: string): Promise<{ id: number }> => {
    await db
        .updateTable("Director")
        .set
        ({
            name,
            nationality,
            dateBirth: new Date(birthDate),
            photoUrl
        })
        .where("id", "=", id)
        .execute();
    return { id };
}

export const deleteDirector = async (id: number): Promise<void> => {
    await db
        .deleteFrom("Director")
        .where("id", "=", id)
        .execute();
}


export const getDirectors = async (): Promise<{ id: number, name: string, nationality: string, dateBirth: Date, photoUrl: string }[]> => {
    const directors = await db
        .selectFrom("Director")
        .select(["id", "name", "nationality", "dateBirth", "photoUrl"])
        .execute();

    return directors;
}


export const createActor = async (name: string, nationality: string, birthDate: string, bio: string, photoUrl: string): Promise<{ id: number }> => {
    const [newActor] = await db
        .insertInto("Actor")
        .values({ name, nationality, dateBirth: new Date(birthDate), bio, photoUrl })
        .returning("id")
        .execute();

    return newActor;
}

export const updateActor = async (id: number, name: string, nationality: string, birthDate: string, bio: string, photoUrl: string): Promise<{ id: number }> => {
    await db
        .updateTable("Actor")
        .set
        ({
            name,
            nationality,
            dateBirth: new Date(birthDate),
            bio,
            photoUrl
        })
        .where("id", "=", id)
        .execute();
    return { id };
}

export const deleteActor = async (id: number): Promise<void> => {
    await db
        .deleteFrom("Actor")
        .where("id", "=", id)
        .execute();
}


export const getActors = async (): Promise<{ id: number, name: string, nationality: string, dateBirth: Date, bio: string | null }[]> => {
    const actors = await db
        .selectFrom("Actor")
        .select(["id", "name", "nationality", "dateBirth", "bio", "photoUrl"])
        .execute();

    return actors;
}


export const getGenres = async (): Promise<{ id: number, name: string }[]> => {
    const genres = await db
        .selectFrom("Genre")
        .select(["id", "name"])
        .execute();

    return genres;
}

interface Movie {
    id: number;
    title: string;
    releaseDate: Date;
    durationMinutes: number;
    rating: number;
    description: string;
    language: string;
    budget?: number | null;
    boxOffice?: number | null;
    posterUrl: string;
    type: "short_movie" | "documentary" | "animation";
}

export const getFullMovies = async (): Promise<Movie[]> => {
    const movies = await db
        .selectFrom("Movie")
        .select(["id", "title", "releaseDate", "durationMinutes", "rating", "description", "language", "budget", "boxOffice", "posterUrl", "type"])
        .execute();

    return movies;
}