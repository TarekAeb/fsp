import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMovieActors } from '@/server/service/Actor';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }

) {
      const { id } = await context.params;
    try {
        // Extract the movie ID from route params correctly
        

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Invalid Movie ID' },
                { status: 400 }
            );
        }

        const movieId = parseInt(id);
        const actors = await getMovieActors(movieId);

        // Check if actors were found
        if (!actors || actors.length === 0) {
            return NextResponse.json(
                { actors: [] },
                { status: 200 }
            );
        }

        // Return a consistently structured response with an actors array
        return NextResponse.json(
            { actors: Array.isArray(actors[0]) ? actors[0] : actors },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching movie actors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch movie actors', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}