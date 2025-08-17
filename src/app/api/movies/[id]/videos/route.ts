// src/app/api/movies/[id]/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: {params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const movieId = parseInt(id);

    if (!movieId) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        videoQualities: {
          orderBy: { quality: 'desc' }
        },
        subtitles: true
      }
    });
    
    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const videoData = {
      qualities: movie.videoQualities.map(vq => ({
        quality: vq.quality,
        src: vq.filePath,
        fileSize: vq.fileSize.toString(),
        duration: vq.duration,
        bitrate: vq.bitrate,
        codec: vq.codec
      })),
      subtitles: movie.subtitles.reduce((acc, sub) => {
        acc[sub.language] = {
          src: sub.filePath,
          label: sub.label,
          isDefault: sub.isDefault
        };
        return acc;
      }, {} as Record<string, unknown>)
    };
    
    return NextResponse.json(videoData);
    
  } catch (error) {
    console.error("Error fetching video data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}