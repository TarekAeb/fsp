import { NextRequest, NextResponse } from 'next/server';
import { getMovies } from '@/server/service/movie';

export async function GET(request: NextRequest) {
    try {
        const movies = await getMovies();
        return NextResponse.json({ message: 'Director created successfully', movies: movies }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
