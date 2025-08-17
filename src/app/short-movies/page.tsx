"use client"
import { useEffect } from "react";
import MovieSection from "@/components/Home/MovieSection";
import Sidebar from "@/components/Home/Sidebar";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ShortMovies() {
  // Pass the type as a query param
  const { data: movies } = useSWR<any>("/api/admin/movies?type=short_movie", fetcher);

  return (
    <div className="w-full min-h-screen">
      <Sidebar />
      <div className="md:ml-16 lg:ml-20">
        <MovieSection title="Popular" movies={movies || []} />
      </div>
    </div>
  );
}