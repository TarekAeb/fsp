import { NextResponse } from "next/server";
import { getLastMovie } from "@/server/service/movie";

export async function GET() {
    try {
        const movie = await getLastMovie();
        return NextResponse.json(movie, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
    }
}
