export const UserRole = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const MovieType = {
    short_movie: "short_movie",
    documentary: "documentary",
    animation: "animation"
} as const;
export type MovieType = (typeof MovieType)[keyof typeof MovieType];
