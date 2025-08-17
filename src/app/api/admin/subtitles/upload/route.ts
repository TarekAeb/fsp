// src/app/api/admin/subtitles/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import authConfig from "@/auth"
import { getServerSession } from "next-auth";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    
    const formData = await req.formData();
    const subtitleFile = formData.get('subtitle') as File;
    const movieId = parseInt(formData.get('movieId') as string);
    const language = formData.get('language') as string;
    
    if (!subtitleFile || !movieId || !language) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Create directory
    const subtitleDir = join(process.cwd(), 'public', 'videos', movieId.toString(), 'subtitles');
    await mkdir(subtitleDir, { recursive: true });
    
    // Save subtitle file
    const filename = `${language}.${subtitleFile.name.split('.').pop()}`;
    const filePath = join(subtitleDir, filename);
    const bytes = await subtitleFile.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    
    // Save to database
    await prisma.videoSubtitle.upsert({
      where: {
        movieId_language: {
          movieId,
          language
        }
      },
      update: {
        filePath: `/videos/${movieId}/subtitles/${filename}`,
        label: getLanguageLabel(language)
      },
      create: {
        movieId,
        language,
        filePath: `/videos/${movieId}/subtitles/${filename}`,
        label: getLanguageLabel(language),
        isDefault: language === 'en'
      }
    });
    
    return NextResponse.json({
      message: "Subtitle uploaded successfully"
    });
    
  } catch (error) {
    console.error("Subtitle upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload subtitle" },
      { status: 500 }
    );
  }
}

function getLanguageLabel(code: string): string {
  const labels: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'ar': 'Arabic'
  };
  return labels[code] || code;
}