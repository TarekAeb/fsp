import { db } from "../database";
export const getMovieActors = async (id: number) => {
    const actors = await db
        .selectFrom("Actor")
        .select(["Actor.photoUrl", "Actor.name"])
        .innerJoin("MovieCast", "MovieCast.actorId", "Actor.id")
        .where("MovieCast.movieId", "=", id)
        .execute();
    return actors;
};