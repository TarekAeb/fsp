import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { deleteMovie, updateMovie } from '@/server/service/admin';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const urlParts = request.url.split('/');
        const movieId = urlParts[urlParts.length - 1];
        if (!movieId) {
            throw new Error('movie ID is required');
        }

        // Create a proper MovieData object
        const movieData = {
            title: body.title,
            releaseDate: body.releaseDate,
            durationMinutes: body.durationMinutes,
            rating: body.rating,
            description: body.description,
            language: body.language,
            posterUrl: body.posterUrl,
            budget: body.budget || null,
            boxOffice: body.boxOffice || null,
            trailerUrl: body.trailerUrl || null,
            genres: body.genres || [],
            directors: body.directors || [],
            cast: body.cast || []
        };

        const { id } = await updateMovie(parseInt(movieId), movieData);
        return NextResponse.json({ message: 'movie updated successfully', id: id }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const urlParts = request.url.split('/');
        const movieId = urlParts[urlParts.length - 1];

        if (!movieId) {
            return NextResponse.json({ error: 'movie ID is required' }, { status: 400 });
        }

        await deleteMovie(parseInt(movieId));
        return NextResponse.json({ message: 'movie deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}