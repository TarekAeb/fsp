// src/lib/VideoSources.ts
export interface VideoData {
  src: string;
  quality: string;
  subtitles: { [language: string]: { src: string; label: string; isDefault: boolean } };
}

export interface VideoQuality {
  quality: string;
  src: string;
  fileSize: string;
  duration: number;
  bitrate?: string;
  codec?: string;
}

// This function now fetches from API instead of using Prisma directly
export async function getVideoSource(movieId: string, quality: string): Promise<VideoData | null> {
  try {
    const response = await fetch(`/api/movies/${movieId}/videos`);
    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }
    
    const data = await response.json();
    
    const videoQuality = data.qualities.find((vq: VideoQuality) => vq.quality === quality);
    if (!videoQuality) return null;
    
    return {
      src: videoQuality.src,
      quality: videoQuality.quality,
      subtitles: data.subtitles
    };
  } catch (error) {
    console.error('Error getting video source:', error);
    return null;
  }
}

export async function getAvailableQualities(movieId: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/movies/${movieId}/videos`);
    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }
    
    const data = await response.json();
    return data.qualities.map((q: VideoQuality) => q.quality);
  } catch (error) {
    console.error('Error getting available qualities:', error);
    return [];
  }
}

// For server-side use only
export async function getVideoSourceServer(movieId: string, quality: string): Promise<VideoData | null> {
  const { prisma } = await import('@/lib/prisma');
  
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(movieId) },
      include: {
        videoQualities: true,
        subtitles: true
      }
    });
    
    if (!movie) return null;
    
    const videoQuality = movie.videoQualities.find(vq => vq.quality === quality);
    if (!videoQuality) return null;
    
    const subtitles: { [language: string]: { src: string; label: string; isDefault: boolean } } = {};
    movie.subtitles.forEach(sub => {
      subtitles[sub.language] = {
        src: sub.filePath,
        label: sub.label,
        isDefault: sub.isDefault
      };
    });
    
    return {
      src: videoQuality.filePath,
      quality: videoQuality.quality,
      subtitles
    };
  } catch (error) {
    console.error('Error getting video source:', error);
    return null;
  }
}