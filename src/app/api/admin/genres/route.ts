import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/database";

// GET - Fetch all genres
export async function GET(request: NextRequest) {
    try {
        const genres = await db
            .selectFrom('Genre')
            .selectAll()
            .orderBy('name')
            .execute();

        return NextResponse.json(genres);
    } catch (error) {
        console.error("Error fetching genres:", error);
        return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 });
    }
}

// POST - Create a new genre
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
            return NextResponse.json({ error: "Genre name is required" }, { status: 400 });
        }

        const [newGenre] = await db
            .insertInto('Genre')
            .values({
                name: body.name.trim()
            })
            .returning(['id', 'name'])
            .execute();

        return NextResponse.json(newGenre, { status: 201 });
    } catch (error) {
        console.error("Error creating genre:", error);
        return NextResponse.json({ error: "Failed to create genre" }, { status: 500 });
    }
}