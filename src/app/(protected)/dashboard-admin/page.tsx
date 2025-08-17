"use client";
import React, { useEffect, useState } from 'react';
import MovieList from '@/components/Dashboard-admin/MovieList';

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
    createdAt: Date;
    updatedAt: Date;
    type: "short_movie" | "documentary" | "animation";
}

export default function Dashboard() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(`/api/movies`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }
                const data = await response.json();
                console.log(data);
                setMovies(data.movies); // Changed to access data.movies since API returns { movies }
            } catch (err) {
                const error = err as Error;
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold">Dashboard Content</h2>
            <MovieList movies={movies} />
        </div>
    );
};
