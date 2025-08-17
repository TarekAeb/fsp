// src/app/movie/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import VideoPlayer from "@/components/movie/player";
import useSWR from "swr";
import Sidebar from "@/components/Home/Sidebar";
import Footer from "@/components/Home/Footer";
import MovieSection from "@/components/Home/MovieSection";
import MovieDescription from "@/components/movie/MovieDescription";
import CastSection from "@/components/movie/CastSection";

type Movie = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  genres: string[];
  posterUrl: string;
  releaseDate: string | Date;
  videoUrl?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MoviePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  // State to control video player visibility
  const [showPlayer, setShowPlayer] = useState(false);

  // Fetch current movie details
  const {
    data: movie,
    error: movieError,
    isLoading: movieLoading,
  } = useSWR<Movie>(id ? `/api/movies/${id}` : null, fetcher);

  // Fetch similar movies
  const { data: similarMovies } = useSWR(`/api/admin/movies`, fetcher);

  // Handle watch button click
  const handleWatchClick = () => {
    setShowPlayer(true);
  };

  // Handle player exit
  const handlePlayerExit = () => {
    setShowPlayer(false);
  };

  // Handle loading states
  if (movieLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle errors
  if (movieError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500 text-xl">❌ Failed to load movie.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Handle missing movie
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl">⚠️ No movie found.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Go Back
        </button>
      </div>
    );
  }

  // CONDITIONAL RENDERING - Show EITHER player OR movie page, never both
  if (showPlayer) {
    return (
      <VideoPlayer
        title={movie.title}
        movieId={movie.id}
        posterUrl={movie.posterUrl} // Add this line
        onExit={handlePlayerExit}
        isVisible={true}
      />
    );
  }

  // Movie page content (only when player is not visible)
  return (
    <div className="flex w-full">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <MovieDescription movie={movie} onWatchClick={handleWatchClick} />
        <CastSection id={movie.id} />
        {similarMovies && similarMovies.length > 0 && (
          <MovieSection title={`More movies`} movies={similarMovies} />
        )}
        <Footer />
      </main>
    </div>
  );
}
