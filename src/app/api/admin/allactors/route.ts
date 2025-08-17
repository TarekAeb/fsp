import { NextRequest, NextResponse } from 'next/server';
import { getActors } from '@/server/service/admin';

export async function GET(request: NextRequest) {
    try {
        const actors = await getActors();
        return NextResponse.json({ message: 'Actor created successfully', actors: actors }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
