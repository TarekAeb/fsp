import { NextRequest, NextResponse } from 'next/server';
import { getDirectors } from '@/server/service/admin';

export async function GET(request: NextRequest) {
    try {
        const directors = await getDirectors();
        return NextResponse.json({ message: 'Director created successfully', directors: directors }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
