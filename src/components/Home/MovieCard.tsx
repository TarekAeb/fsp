"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Icon from "../ui/icon";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate?: Date;
  durationMinutes?: number;
  rating?: number;
  description?: string;
  language?: string;
  genres?: {
    id: number;
    name: string;
  }[];
  type: "short_movie" | "documentary" | "animation";
}

interface MovieProps {
  movie: Movie;
  className?: string;
}

export default function MovieCard({ movie, className }: MovieProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (session?.user?.id) checkIfSaved();
  }, [session?.user?.id, movie.id]);

  const checkIfSaved = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(
        `/api/user/favorites/check?movieId=${movie.id}`
      );
      if (response.ok) {
        const { isSaved } = await response.json();
        setIsSaved(isSaved);
      }
    } catch (error) {
      console.error("Error checking if movie is saved:", error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) {
      toast.error("Please sign in to save movies");
      return;
    }
    setIsLoading(true);
    try {
      const endpoint = isSaved
        ? "/api/user/favorites/remove"
        : "/api/user/favorites/add";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie.id }),
      });
      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(
          isSaved
            ? `Removed "${movie.title}" from your favorites`
            : `Added "${movie.title}" to your favorites`
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (movie.id) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/movie/${movie.id}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Movie link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy link");
      }
    } else {
      toast.error("No movie found");
    }
  };

  const handleImageError = () => setImageError(true);

  // Format info text (genre, duration, date)
  const infoText = [
    movie.genres && movie.genres.length > 0
      ? movie.genres
          .slice(0, 3)
          .map((g) => g.name.toUpperCase())
          .join(" • ")
      : "Unknown Genre",
    movie.durationMinutes ? `${movie.durationMinutes} MIN` : null,
    movie.releaseDate
      ? new Date(movie.releaseDate).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        })
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="relative w-[320px] h-[240px] bg-black rounded-sm overflow-hidden group">
      <Link href={`/movie/${movie.id}`} className="block w-full h-full">
        {/* Image wrapper */}
        <div className="absolute inset-0 h-[180px] transition-all duration-500 group-hover:h-[260px]">
          {!imageError ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
              style={{ transformOrigin: "top" }}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-400 dark:bg-gray-600 rounded-sm flex items-center justify-center">
                  <span className="text-2xl">Frame</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {movie.title}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Movie title */}
        <div
          className={cn(
            "movie-title absolute top-[150px] left-0 w-full text-white text-center font-bold text-lg z-20 opacity-0 translate-y-2 transition-all duration-400",
            "group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          {movie.title}
        </div>

        {/* Expand content */}
        <div
          className={cn(
            "expand-content absolute top-[180px] left-0 w-full h-36  px-3 py-1 box-border z-30 flex flex-col justify-start items-center",
            "opacity-0 translate-y-full transition-all duration-500",
            "group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          <div className="button-row flex justify-center items-center gap-3 mb-1">
            <Button
              onClick={handleShare}
              aria-label="Share movie"
              tabIndex={-1}
              size={"hover"}
            >
              <Icon path="/icons/share.svg" size={2} />
            </Button>
            <Button tabIndex={-1} size={"sm"} className="px-14 text-md">
              Watch
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size={"hover"}
              aria-label={
                isSaved ? "Remove from favorites" : "Add to favorites"
              }
              tabIndex={-1}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent  animate-spin" />
              ) : isSaved ? (
                <Icon path="/icons/save.svg" size={2} />
              ) : (
                <Icon path="/icons/bold save.svg" size={2} />
              )}
            </Button>
          </div>
          <div className="info-text text-[10px] text-gray-300 text-center mt-1">
            {infoText}
          </div>
        </div>
      </Link>
    </div>
  );
}
