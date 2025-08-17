import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMovieById } from '@/server/service/movie';

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
    type: "short_movie" | "documentary" | "animation";
}

export const GET = async (req: NextRequest) => {
    try {
        const urlParts = req.url.split('/');
        const movieId = urlParts[urlParts.length - 1];

        if (!movieId) {
            return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
        }

        const movie = await getMovieById(parseInt(movieId));

        if (!movie || movie.length === 0) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json(movie[0], { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
    }
}