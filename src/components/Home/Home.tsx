'use client';
import MovieDescription from "../movie/MovieDescription";
import Footer from "./Footer";
import MovieSection from "./MovieSection";
import Sidebar from "./Sidebar";
import useSWR from "swr";

type Movie = {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    genres: string[];
    posterUrl: string;
    releaseDate: string | Date;
    type: "short_movie" | "documentary" | "animation";
};
type MovieResponse = {
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
const fetcher = (url: string) => fetch(url).then(res => res.json());
const fetcher1 = (url: string) => fetch(url).then(res => res.json());

export default function HomePage() {
    const { data: movie, error, isLoading } = useSWR<Movie>("/api/last-movie", fetcher);
    const { data: movies, error: moviesError, isLoading: moviesLoading } = useSWR<MovieResponse[]>("/api/admin/movies", fetcher1);
    console.log(movies);

    // Handle loading state
    if (isLoading || moviesLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    // Handle error state
    if (error || moviesError) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                Error loading content
            </div>
        );
    }

    // Handle empty data
    if (!movie) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                No movies available
            </div>
        );
    }

    return (
        <div className="flex w-full">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">
                <MovieDescription movie={movie} />
                <MovieSection title="short movies" movies={movies || null} />
                <MovieSection title="short movies" movies={movies || null} />
                <Footer />
            </main>
        </div>
    );
}