"use client";
import React from "react";
import Sidebar from "@/components/Home/Sidebar";
import MovieCard from "@/components/Home/MovieCard";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import useSWR from "swr";

type Movie = {
  id: number;
  title: string;
  rating: number;
  posterUrl: string;
  trailerUrl: string | null;
  addedAt?: Date;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SavedPage() {
  const {
    data: response,
    error: movieError,
    isLoading: movieLoading,
  } = useSWR<{ movies: Movie[] }>("/api/user/favorites", fetcher);
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch saved movies for current user

  const movies = response?.movies || [];

  if (movieError) {
    console.error("Failed to fetch saved movies:", movieError);
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4">
            <h1 className="text-3xl mb-4">Saved Content</h1>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-red-500">Failed to load saved movies.</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (movieLoading) {
    return (
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4">
            <h1 className="text-3xl mb-4">Saved Content</h1>
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4">
          <h1 className="text-3xl mb-4">Saved Content</h1>
          {movies.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No saved movies yet</h3>
              <p>Start saving movies you want to watch later!</p>
            </div>
          ) : (
            <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <div key={String(movie.id)}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}