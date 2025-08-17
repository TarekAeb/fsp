"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import Icon from "../ui/icon";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Movie {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  genres: string[];
  posterUrl: string;
  releaseDate: string | Date;
  type: "short_movie" | "documentary" | "animation";
}

interface HeroProps extends Movie {
  onWatchClick?: () => void; // New prop for watch button
}

export default function Hero({ onWatchClick, ...movie }: HeroProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
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
  const featuredMovie = useMemo(() => {
    const formatDate = (dateInput: string | Date) => {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      const months = [
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    };

    return {
      ...movie,
      releaseDate: formatDate(movie.releaseDate),
    };
  }, [movie]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
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
  const handleShareClick = async (e: React.MouseEvent) => {
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

  return (
    <div
      className="absolute bottom-0 left-0 lg:left-0 w-full p-6 md:p-10 
    flex flex-col items-center lg:items-start
    text-center lg:text-left
    lg:max-w-[50%]"
    >
      <h2 className="text-3xl md:text-5xl mb-2 text-white">
        {featuredMovie.title}
      </h2>

      {/* Movie Metadata */}
      <div className="flex flex-wrap justify-center lg:justify-start items-center text-sm text-gray-300 mb-3">
        {featuredMovie.genres &&
          featuredMovie.genres.map((genre, index) => (
            <span key={genre} className="mr-2">
              <span className="text-primary">{"• "}</span>
              {genre.toUpperCase()}
            </span>
          ))}
        <span className="mr-3">{featuredMovie.durationMinutes} MIN</span>
        <span className="mr-3">{featuredMovie.releaseDate}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-4">
          <Button size={"lg"} onClick={onWatchClick ? undefined : () => window.location.pathname = `/movie/${featuredMovie.id}`}>
            Watch
          </Button>
          <Button
            aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
            size={"icon"}
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isSaved ? (
              <Icon path="/icons/save.svg" size={2} />
            ) : (
              <Icon path="/icons/bold save.svg" size={2} />
            )}
          </Button>
          <Button
            aria-label="share Movie"
            size={"icon"}
            onClick={handleShareClick}
          >
            <Icon path="/icons/share.svg" size={2} />
          </Button>
        </div>
        <div className="flex lg:hidden items-center space-x-4">
          <Button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            size={"icon"}
            aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
            tabIndex={-1}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isSaved ? (
              <Icon path="/icons/save.svg" size={2} />
            ) : (
              <Icon path="/icons/bold save.svg" size={2} />
            )}
          </Button>
          <Button
            size={"default"}
            onClick={
              onWatchClick
                ? undefined
                : () =>
                    (window.location.pathname = `/movie/${featuredMovie.id}`)
            }
          >
            Watch
          </Button>
          <Button
            aria-label="share Movie"
            size={"icon"}
            onClick={handleShareClick}
          >
            <Icon path="/icons/share colored.svg" size={2} />
          </Button>
        </div>
      </div>

      {/* Movie description */}
      <p className="text-gray-300 mt-4 mb-6 line-clamp-3 text-sm md:text-lg max-w-md lg:max-w-none">
        {featuredMovie.description}
      </p>
    </div>
  );
}
