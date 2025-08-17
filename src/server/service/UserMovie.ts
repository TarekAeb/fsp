import { db } from "@/server/database";

export const addToFavorite = async (userId: string, movieId: number) => {
    const favorite = await db
        .insertInto("UserFavorite")
        .values({
            userId: userId,
            movieId: movieId,
            addedAt: new Date() // or use a default value if defined in the schema
        })
        .execute();
    return favorite;
}

export const removeFromFavorite = async (userId: string, movieId: number) => {
    const removedFavorite = await db
        .deleteFrom("UserFavorite")
        .where("userId", "=", userId)
        .where("movieId", "=", movieId)
        .execute();
    return removedFavorite;
}

export const getFavoritesByUserId = async (userId: string) => {
    const favorites = await db
        .selectFrom("UserFavorite")
        .select(["movieId"])
        .where("userId", "=", userId)
        .execute();
    return favorites;
}

export const getFavoritesByMovieId = async (movieId: number) => {
    const favorites = await db
        .selectFrom("UserFavorite")
        .select(["userId"])
        .where("movieId", "=", movieId)
        .execute();
    return favorites;
}

