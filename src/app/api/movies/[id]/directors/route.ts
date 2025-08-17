import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMovieDirector } from '@/server/service/Director';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Extract the movie ID from route params correctly
        const { id } = await context.params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid Movie ID' },
                { status: 400 }
            );
        }

        const movieId = parseInt(id);
        const directors = await getMovieDirector(movieId);

        // Check if directors were found
        if (!directors || directors.length === 0) {
            return NextResponse.json(
                { directors: [] },
                { status: 200 }
            );
        }

        // Return a consistently structured response with a directors array
        return NextResponse.json(
            { directors: Array.isArray(directors[0]) ? directors[0] : directors },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching movie directors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch movie directors', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}