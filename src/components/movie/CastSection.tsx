"use client"
import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Improved types with more properties
interface Person {
    id: number;
    name: string;
    photoUrl: string | null;
}

interface Director extends Person {
    filmography?: string[];
}

interface Actor extends Person {
    role?: string;
    character?: string;
}

interface CastSectionProps {
    id: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CastSection({ id }: CastSectionProps) {
    const [showAll, setShowAll] = useState(false);

    // Fetch directors data
    const { data: directorsData, error: directorError, isLoading: directorLoading } =
        useSWR<{ directors: Director[] } | Director[]>(id ? `/api/movies/${id}/directors` : null, fetcher);

    // Fetch actors data
    const { data: actorsData, error: actorError, isLoading: actorLoading } =
        useSWR<{ actors: Actor[] } | Actor[]>(id ? `/api/movies/${id}/actors` : null, fetcher);

    // Extract arrays safely, handling both array and object responses
    const directors = Array.isArray(directorsData) ? directorsData : directorsData?.directors || [];
    const actors = Array.isArray(actorsData) ? actorsData : actorsData?.actors || [];

    // Loading state with skeleton UI
    if (directorLoading || actorLoading) {
        return (
            <div className="w-full flex flex-col items-start gap-4 p-4">
                <h4 className="text-xl font-bold">CAST</h4>
                <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array(6).fill(0).map((_, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error handling
    if (directorError || actorError) {
        return (
            <div className="w-full flex flex-col items-start gap-4 p-4">
                <h4 className="text-xl font-bold">CAST</h4>
                <p className="text-red-500">Error loading cast information</p>
            </div>
        );
    }

    // Determine how many items to show - FIXED THE SLICE ISSUE
    const displayActors = showAll ? actors : actors.slice(0, 6);
    const hasMoreActors = actors.length > 6;

    // Handle empty case
    if (directors.length === 0 && actors.length === 0) {
        return (
            <div className="w-full flex flex-col items-start gap-4 p-4">
                <h4 className="text-xl">CAST</h4>
                <p className="text-gray-400">No cast information available for this title.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-start gap-3 py-4 px-3">
            <h4 className="text-2xl">CAST</h4>
            <div className="w-full flex items-center gap-6 pl-3">

                {/* Directors section */}
                {directors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {directors.map((director, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage
                                        src={director.photoUrl || ''}
                                        alt={director.name}
                                    />
                                    <AvatarFallback className="bg-primary/20">
                                        {director.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {/* <p className="text-center font-medium">{director.name}</p> */}
                            </div>
                        ))}
                    </div>
                )}

                {/* Actors section */}
                {actors.length > 0 && (
                    <div className="flex">
                        {/* <h5 className="text-lg font-semibold text-gray-200">Actors</h5> */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {displayActors.map((actor, index) => (
                                <div key={index} className="flex flex-col items-center gap-2">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={actor.photoUrl || ''}
                                            alt={actor.name}
                                        />
                                        <AvatarFallback className="bg-secondary/20 text-xl">
                                            {actor.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* <p className="text-center font-medium">{actor.name}</p> */}
                                    {actor.character && (
                                        <p className="text-center text-sm text-gray-400">as {actor.character}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Show more/less button */}
                        {hasMoreActors && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="self-center mt-4 px-4 py-2 bg-primary/20 rounded-md hover:bg-primary/30 transition-colors"
                            >
                                {showAll ? 'Show Less' : `Show All (${actors.length})`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}