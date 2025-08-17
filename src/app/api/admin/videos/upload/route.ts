// src/app/api/admin/videos/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import authConfig from "@/auth"
import { getServerSession } from "next-auth";
import { requireRole } from "@/lib/rbac";
import { startVideoConversion } from "@/lib/video-processing";

export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const movieId = parseInt(formData.get('movieId') as string);
    
    if (!videoFile || !movieId) {
      return NextResponse.json(
        { error: "Video file and movie ID are required" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'];
    if (!validTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload MP4, AVI, MOV, MKV, or WEBM files." },
        { status: 400 }
      );
    }
    
    // Validate file size (2GB max)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 2GB" },
        { status: 400 }
      );
    }
    
    // Create unique filename
    const fileId = uuidv4();
    const originalExtension = videoFile.name.split('.').pop();
    const filename = `${fileId}.${originalExtension}`;
    
    // Create directory structure
    const uploadDir = join(process.cwd(), 'public', 'videos', 'originals');
    await mkdir(uploadDir, { recursive: true });
    
    // Save original file
    const originalPath = join(uploadDir, filename);
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(originalPath, buffer);
    
    console.log(`Video uploaded: ${filename}, Size: ${videoFile.size} bytes`);
    
    // Start video conversion process
    const jobId = await startVideoConversion(movieId, originalPath, fileId);
    
    return NextResponse.json({
      message: "Video uploaded successfully, conversion started",
      jobId,
      fileId,
      originalSize: videoFile.size,
      originalName: videoFile.name
    });
    
  } catch (error) {
    console.error("Video upload error:", error);
    
    if (error instanceof Error && error.message.includes('role')) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to upload video. Please try again." },
      { status: 500 }
    );
  }
}