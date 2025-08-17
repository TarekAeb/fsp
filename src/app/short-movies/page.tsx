"use client"
import MovieSection from "@/components/Home/MovieSection";
import Sidebar from "@/components/Home/Sidebar";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then(res => res.json());
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
export default function ShortMovies() {
  // Pass the type as a query param
  const { data: movies } = useSWR<MovieResponse[]>("/api/admin/movies?type=short_movie", fetcher);

  return (
    <div className="w-full min-h-screen">
      <Sidebar />
      <div className="md:ml-16 lg:ml-20">
        <MovieSection title="Popular" movies={movies || []} />
      </div>
    </div>
  );
}