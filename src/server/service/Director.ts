import { db } from "@/server/database";

export const getDirectors = async (directorName: string) => {
    const directors = await db
        .selectFrom("Director")
        .select("id")
        .where("name", "=", directorName)
        .executeTakeFirst();
    return directors;
};

export const getDirectorById = async (directorId: number) => {
    const director = await db
        .selectFrom("Director")
        .select(["name"])
        .where("id", "=", directorId)
        .executeTakeFirst();
    return director;
};

export const getMovieDirector = async (id: number) => {
    const directors = await db
        .selectFrom("Director")
        .select(["Director.photoUrl", "Director.name"])
        .innerJoin("MovieDirector", "MovieDirector.directorId", "Director.id")
        .where("MovieDirector.movieId", "=", id)
        .execute();
    return directors;
}