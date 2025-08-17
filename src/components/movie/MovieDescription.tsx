"use client"
import { useState } from "react"
import Hero from "../Home/Hero";
import Header from "../Home/Header";

type Movie = {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    genres: string[];
    posterUrl: string;
    releaseDate: string | Date;
    type: "short_movie" | "documentary" | "animation";
}

interface MovieDescriptionProps {
    movie: Movie;
    onWatchClick?: () => void; // Add this prop
}

export default function MovieDescription({ movie, onWatchClick }: MovieDescriptionProps) {
    return (
        <div className="relative mb-8">
            <div
                className="w-full bg-cover bg-center"
                style={{
                    background: `
                        linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0) 100%),
                        url(${movie.posterUrl}) center/cover no-repeat
                    `,
                    height: "70vh"  // Responsive height
                }}
            >
                <Header />
                <Hero {...movie} onWatchClick={onWatchClick} />
            </div>
        </div>
    )
}