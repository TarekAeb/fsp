import { getFullMovies } from '@/server/service/admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    type: "short_movie" | "documentary" | "animation";
}


export const GET = async (req: NextRequest) => {
    try {
        const movies: Movie[] = await getFullMovies(); // Call your server-only function
        return NextResponse.json({ movies: movies }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
};