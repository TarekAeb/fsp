import React from "react";
// Fixed import path - adjust based on your project structure
import MovieCard from "./MovieCard";
interface Movie {
    id: number;
    title: string;
    releaseDate: Date;
    durationMinutes: number;
    rating: number;
    description: string;
    language: string;
    posterUrl: string;
    genres?: {
        id: number;
        name: string;
    }[];
    type: "short_movie" | "documentary" | "animation";
}
interface MovieSectionProps {
    title: string,
    movies: Movie[] | null;
}

export default function MovieSection(props: MovieSectionProps) {


    return (
        <div className="">
            <h3 className="text-2xl mb-6 px-4">{props.title.toUpperCase()}</h3>

            <div
                className="px-8 flex gap-5"
            >
                {props.movies && props.movies.length > 0 ? (
                    props.movies.slice(0, 5).map((movie) => (
                        <div
                            key={String(movie.id)}
                        >
                            <MovieCard movie={movie} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-5 text-center py-10 text-gray-400">
                        No movies available in this category
                    </div>
                )}
            </div>
        </div>
    );
}