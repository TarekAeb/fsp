// src/lib/video-processing.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { prisma } from '@/lib/prisma';
import { stat } from 'fs/promises';

const execAsync = promisify(exec);

export interface ConversionJob {
  id: string;
  movieId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: { [quality: string]: number };
  originalPath: string;
  fileId: string;
  error?: string;
  startTime: Date;
  lastUpdate: Date;
}

// In-memory job storage with better persistence
const conversionJobs = new Map<string, ConversionJob>();

// Add job cleanup and persistence
const JOB_RETENTION_TIME = 2 * 60 * 60 * 1000; // 2 hours

const QUALITY_CONFIGS = {
  '1080p': { 
    resolution: '1920x1080', 
    bitrate: '5000k',
    audioBitrate: '192k'
  },
  '720p': { 
    resolution: '1280x720', 
    bitrate: '2500k',
    audioBitrate: '128k'
  },
  '480p': { 
    resolution: '854x480', 
    bitrate: '1000k',
    audioBitrate: '128k'
  },
  '360p': { 
    resolution: '640x360', 
    bitrate: '500k',
    audioBitrate: '96k'
  }
};

export async function startVideoConversion(
  movieId: number, 
  originalPath: string, 
  fileId: string
): Promise<string> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const job: ConversionJob = {
    id: jobId,
    movieId,
    status: 'pending',
    progress: {},
    originalPath,
    fileId,
    startTime: new Date(),
    lastUpdate: new Date()
  };
  
  // Store job immediately
  conversionJobs.set(jobId, job);
  console.log(`Created conversion job: ${jobId} for movie ${movieId}`);
  console.log(`Total jobs in memory: ${conversionJobs.size}`);
  
  // Start conversion process in background
  processVideo(job).catch(error => {
    console.error(`Conversion job ${jobId} failed:`, error);
    const failedJob = conversionJobs.get(jobId);
    if (failedJob) {
      failedJob.status = 'failed';
      failedJob.error = error.message;
      failedJob.lastUpdate = new Date();
      conversionJobs.set(jobId, failedJob);
    }
  });
  
  return jobId;
}

async function processVideo(job: ConversionJob) {
  try {
    // Update job status and ensure it's stored
    job.status = 'processing';
    job.lastUpdate = new Date();
    conversionJobs.set(job.id, job);
    
    console.log(`Starting video conversion for job ${job.id}`);
    
    // Create output directory
    const outputDir = join(process.cwd(), 'public', 'videos', job.movieId.toString());
    await mkdir(outputDir, { recursive: true });
    
    // Get video info first
    const videoInfo = await getVideoInfo(job.originalPath);
    console.log(`Video info for job ${job.id}:`, videoInfo);
    
    // Convert to each quality
    for (const [quality, config] of Object.entries(QUALITY_CONFIGS)) {
      const outputPath = join(outputDir, `${job.fileId}_${quality}.mp4`);
      
      // Initialize progress for this quality
      job.progress[quality] = 0;
      job.lastUpdate = new Date();
      conversionJobs.set(job.id, job);
      
      console.log(`Converting job ${job.id} to ${quality}...`);
      
      await convertVideo(
        job.originalPath,
        outputPath,
        config,
        videoInfo.duration,
        (progress) => {
          // Update progress and store job
          const currentJob = conversionJobs.get(job.id);
          if (currentJob) {
            currentJob.progress[quality] = Math.round(progress);
            currentJob.lastUpdate = new Date();
            conversionJobs.set(job.id, currentJob);
            console.log(`Job ${job.id} - ${quality}: ${progress.toFixed(1)}%`);
          }
        }
      );
      
      // Get file size after conversion
      const fileSize = await getFileSize(outputPath);
      
      // Save to database
      await prisma.videoQuality.upsert({
        where: {
          movieId_quality: {
            movieId: job.movieId,
            quality
          }
        },
        update: {
          filePath: `/videos/${job.movieId}/${job.fileId}_${quality}.mp4`,
          fileSize: fileSize,
          duration: videoInfo.duration,
          bitrate: config.bitrate,
          codec: 'h264'
        },
        create: {
          movieId: job.movieId,
          quality,
          filePath: `/videos/${job.movieId}/${job.fileId}_${quality}.mp4`,
          fileSize: fileSize,
          duration: videoInfo.duration,
          bitrate: config.bitrate,
          codec: 'h264'
        }
      });
      
      // Mark this quality as complete
      job.progress[quality] = 100;
      job.lastUpdate = new Date();
      conversionJobs.set(job.id, job);
      console.log(`Job ${job.id} - ${quality} conversion completed`);
    }
    
    // Mark job as completed
    job.status = 'completed';
    job.lastUpdate = new Date();
    conversionJobs.set(job.id, job);
    console.log(`Video conversion completed for job ${job.id}`);
    
  } catch (error) {
    console.error(`Video conversion failed for job ${job.id}:`, error);
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    job.lastUpdate = new Date();
    conversionJobs.set(job.id, job);
    throw error;
  }
}

async function convertVideo(
  inputPath: string,
  outputPath: string,
  config: { resolution: string; bitrate: string; audioBitrate: string },
  totalDuration: number,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // FFmpeg command with optimized settings
    const command = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-s', config.resolution,
      '-b:v', config.bitrate,
      '-b:a', config.audioBitrate,
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      '-f', 'mp4',
      '-y', // Overwrite output file
      `"${outputPath}"`
    ].join(' ');

    console.log(`Executing: ${command}`);
    
    const process = exec(command, {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    let lastProgress = 0;
    
    process.stderr?.on('data', (data) => {
      const output = data.toString();
      
      // Parse FFmpeg progress output
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch && totalDuration > 0) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseFloat(timeMatch[3]);
        const currentTime = hours * 3600 + minutes * 60 + seconds;
        
        const progress = Math.min(95, (currentTime / totalDuration) * 100);
        if (progress > lastProgress + 1) { // Only update if progress increased by more than 1%
          lastProgress = progress;
          onProgress(progress);
        }
      }
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function getVideoInfo(filePath: string) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
    );
    
    const info = JSON.parse(stdout);
    const videoStream = info.streams.find((stream: any) => stream.codec_type === 'video');
    
    return {
      duration: Math.floor(parseFloat(info.format.duration || '0')),
      width: videoStream?.width || 0,
      height: videoStream?.height || 0,
      bitrate: info.format.bit_rate || '0'
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw new Error('Failed to analyze video file');
  }
}

async function getFileSize(filePath: string): Promise<bigint> {
  try {
    const stats = await stat(filePath);
    return BigInt(stats.size);
  } catch (error) {
    console.error('Error getting file size:', error);
    return BigInt(0);
  }
}

export function getConversionJob(jobId: string): ConversionJob | undefined {
  const job = conversionJobs.get(jobId);
  console.log(`Job lookup for ${jobId}: ${job ? 'found' : 'not found'}`);
  console.log(`Available jobs: ${Array.from(conversionJobs.keys()).join(', ')}`);
  return job;
}

export function getAllJobs(): ConversionJob[] {
  return Array.from(conversionJobs.values());
}

export function cleanupOldJobs() {
  const now = new Date();
  let cleanedCount = 0;
  
  conversionJobs.forEach((job, jobId) => {
    const age = now.getTime() - job.lastUpdate.getTime();
    if (age > JOB_RETENTION_TIME) {
      conversionJobs.delete(jobId);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old conversion jobs`);
  }
}

// Periodic cleanup
setInterval(cleanupOldJobs, 30 * 60 * 1000); // Run every 30 minutes