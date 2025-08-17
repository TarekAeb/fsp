// src/app/api/admin/videos/[movieId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import authConfig from "@/auth"
import { getServerSession } from "next-auth";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

// Get all video qualities for a movie
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ movieId: string }> }
) {
  const params = await context.params
  try {
    await requireRole("ADMIN");
    const movieId = parseInt(params.movieId);
    
    const videoQualities = await prisma.videoQuality.findMany({
      where: { movieId },
      orderBy: { quality: 'desc' }
    });
    
    return NextResponse.json({
      movieId,
      videos: videoQualities
    });
    
  } catch (error) {
    console.error("Error fetching video qualities:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// Delete all videos for a movie
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ movieId: string }> }
) {
  const params = await context.params;
  try {
    await requireRole("ADMIN");
    
    const movieId = parseInt(params.movieId);
    
    // Get all video qualities to delete files
    const videoQualities = await prisma.videoQuality.findMany({
      where: { movieId }
    });
    
    // Delete physical files
    for (const video of videoQualities) {
      try {
        const filePath = join(process.cwd(), 'public', video.filePath);
        await unlink(filePath);
      } catch (error) {
        console.warn(`Failed to delete file: ${video.filePath}`, error);
      }
    }
    
    // Delete database records
    await prisma.videoQuality.deleteMany({
      where: { movieId }
    });
    
    return NextResponse.json({
      message: `Deleted ${videoQualities.length} video files for movie ${movieId}`
    });
    
  } catch (error) {
    console.error("Error deleting videos:", error);
    return NextResponse.json(
      { error: "Failed to delete videos" },
      { status: 500 }
    );
  }
}