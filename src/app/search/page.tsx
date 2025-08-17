"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search as SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/Home/MovieCard";
import useSWR from "swr";
import Sidebar from "@/components/Home/Sidebar";
import { debounce } from "lodash";
import MovieSection from "@/components/Home/MovieSection";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

type Movie = {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate: Date;
  relevanceScore?: number;
  genres?: {id:number,name:string}[];
  durationMinutes: number;
  rating: number;
  description: string;
  language: string;
};

type Suggestion = {
  text: string;
  type: "movie" | "genre";
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Search() {
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);

  // Fetch top searched movies
  const { data: topMoviesData, error: topMoviesError } = useSWR<{
    movies: Movie[];
  }>("/api/movies/top-searched", fetcher);

  const topMovies = topMoviesData?.movies || [];

  // Debounce the query to avoid too many API calls
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Fetch search results
  const {
    data: MovieData,
    error: movieError,
    isLoading: movieLoading,
  } = useSWR<{ movies: Movie[] }>(
    debouncedQuery && debouncedQuery.length >= 2
      ? `/api/search/${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher
  );

  // Fetch suggestions
  const { data: suggestionsData } = useSWR<{ suggestions: Suggestion[] }>(
    query && query.length >= 2 && focus
      ? `/api/search/suggestions?q=${encodeURIComponent(query)}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (suggestionsData?.suggestions) {
      setSuggestions(suggestionsData.suggestions);
    } else {
      setSuggestions([]);
    }
  }, [suggestionsData]);

  const movies = MovieData?.movies || [];

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          setQuery(suggestions[selectedSuggestion].text);
          setFocus(false);
          setSelectedSuggestion(-1);
        }
        break;
      case "Escape":
        setFocus(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setFocus(false);
    setSuggestions([]);
    setSelectedSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setFocus(false);
    setSelectedSuggestion(-1);
  };

  // Format year from date
  const getYear = (date: Date) => {
    return new Date(date).getFullYear();
  };

  return (
    <div className="group/sidebar-wrapper flex min-h-svh w-full bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="w-full flex flex-col bg-background text-foreground">
        {/* Header with Search */}
        <div className="mx-auto px-6 py-8 w-full">
          <div className="flex items-center justify-between mb-8 w-full">
            <div className="flex-1 mx-auto relative w-full">
              <div className="relative w-full h-10 lg:h-12">
                <SearchIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-foreground"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search for movies, genres..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFocus(true);
                    setSelectedSuggestion(-1);
                  }}
                  onFocus={() => setFocus(true)}
                  onKeyDown={handleKeyDown}
                  className="h-10 lg:h-12 pl-10 pr-10 py-2 bg-secondary border-secondary-foreground text-background w-full rounded-sm text-md"
                />
                {query && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-foreground hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {focus && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.text}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer ${
                        index === selectedSuggestion ? "bg-gray-700" : ""
                      }`}
                    >
                      <SearchIcon size={16} className="text-gray-400" />
                      <span className="flex-1">{suggestion.text}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Results Dropdown */}
              {focus && debouncedQuery && debouncedQuery.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-gray-700 rounded-md shadow-lg max-h-80 overflow-y-auto">
                  {movieLoading ? (
                    <div className="p-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-2 justify-center mb-2">
                          <SearchIcon />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : movieError ? (
                    <div className="p-4 text-red-400 text-center">
                      Failed to search. Please try again.
                    </div>
                  ) : movies.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">
                      <p>No results found for {debouncedQuery}</p>
                      <p className="text-sm mt-1">
                        Try checking for typos or using different keywords
                      </p>
                    </div>
                  ) : (
                    <div>
                      {movies.slice(0, 8).map((movie) => (
                        <Link
                          href={`/movie/${movie.id}`}
                          key={movie.id}
                          className="block p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-800 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {movie.title.toUpperCase()} (
                                {getYear(movie.releaseDate)})
                              </p>
                              {movie.relevanceScore &&
                                movie.relevanceScore < 90 && (
                                  <p className="text-xs text-gray-500">
                                    {Math.round(movie.relevanceScore)}% match
                                  </p>
                                )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {movies.length > 8 && (
                        <div className="p-2 text-center text-sm border-t border-gray-700">
                          <button
                            onClick={() => setFocus(false)}
                            className="text-primary hover:underline text-sm"
                          >
                            View all {movies.length} results
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Search Results - Text Only */}
          {!focus && debouncedQuery && (
            <div className="mt-6">
              <h2 className="text-2xl font-medium mb-6">
                {movieLoading
                  ? "Searching..."
                  : movies.length > 0
                  ? `Search results for "${debouncedQuery}"`
                  : `No results found for "${debouncedQuery}"`}
              </h2>

              {movieLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full max-w-md" />
                  ))}
                </div>
              ) : movies.length > 0 ? (
                <motion.div
                  className="space-y-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {movies.map((movie) => (
                    <motion.div key={movie.id} variants={itemVariants}>
                      <Link
                        href={`/movie/${movie.id}`}
                        className="block p-3 hover:bg-gray-800/50 rounded-md transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium">
                            {movie.title.toUpperCase()} (
                            {getYear(movie.releaseDate)})
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : debouncedQuery ? (
                <div className="text-center py-12">
                  <SearchIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No matches found</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We couldn&apos;t find anything matching &quot;
                    {debouncedQuery}&quot;. The search includes fuzzy matching
                    for typos.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Top Searched Movies - Only shown when not searching */}
          {/* {!focus && !debouncedQuery && (
            <div className="mt-8">
              {topMoviesError ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    Failed to load top searched movies
                  </p>
                </div>
              ) : topMovies.length > 0 ? (
                <MovieSection title="Top Searched" movies={topMovies} />
              ) : (
                <div className="text-center py-16">
                  <SearchIcon className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                  <h3 className="text-2xl font-medium mb-2">Discover Movies</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Search for movies with fuzzy matching - even misspelled
                    words will find results!
                  </p>
                </div>
              )}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
