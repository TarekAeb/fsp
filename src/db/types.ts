import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { UserRole, MovieType } from "./enums";

export type Account = {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Actor = {
    id: Generated<number>;
    name: string;
    nationality: string;
    dateBirth: Timestamp;
    bio: string | null;
    photoUrl: string | null;
};
export type Director = {
    id: Generated<number>;
    name: string;
    nationality: string;
    dateBirth: Timestamp;
    photoUrl: string;
};
export type Genre = {
    id: Generated<number>;
    name: string;
};
export type Movie = {
    id: Generated<number>;
    title: string;
    releaseDate: Timestamp;
    durationMinutes: number;
    rating: number;
    description: string;
    language: string;
    posterUrl: string;
    budget: number | null;
    boxOffice: number | null;
    trailerUrl: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    type: MovieType;
};
export type MovieCast = {
    movieId: number;
    actorId: number;
    roleName: string;
};
export type MovieDirector = {
    movieId: number;
    directorId: number;
};
export type MovieGenre = {
    movieId: number;
    genreId: number;
};
export type ResetPasswordToken = {
    id: string;
    email: string;
    token: string;
    expires: Timestamp;
};
export type Review = {
    id: Generated<number>;
    userId: string;
    movieId: number;
    rating: number;
    comment: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Session = {
    sessionToken: string;
    userId: string;
    expires: Timestamp;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type User = {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    emailVerified: Timestamp | null;
    password: string | null;
    image: string | null;
    role: Generated<UserRole>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type UserFavorite = {
    userId: string;
    movieId: number;
    addedAt: Generated<Timestamp>;
};
export type VerificationToken = {
    id: string;
    email: string;
    token: string;
    expires: Timestamp;
};
export type VideoQuality = {
    id: Generated<number>;
    movieId: number;
    quality: string;
    filePath: string;
    fileSize: string;
    duration: number;
    bitrate: string | null;
    codec: string | null;
    createdAt: Generated<Timestamp>;
};
export type VideoSubtitle = {
    id: Generated<number>;
    movieId: number;
    language: string;
    label: string;
    filePath: string;
    isDefault: Generated<boolean>;
    createdAt: Generated<Timestamp>;
};
export type DB = {
    Account: Account;
    Actor: Actor;
    Director: Director;
    Genre: Genre;
    Movie: Movie;
    MovieCast: MovieCast;
    MovieDirector: MovieDirector;
    MovieGenre: MovieGenre;
    ResetPasswordToken: ResetPasswordToken;
    Review: Review;
    Session: Session;
    User: User;
    UserFavorite: UserFavorite;
    VerificationToken: VerificationToken;
    VideoQuality: VideoQuality;
    VideoSubtitle: VideoSubtitle;
};
