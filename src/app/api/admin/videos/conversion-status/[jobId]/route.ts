// src/app/api/admin/videos/conversion-status/[jobId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConversionJob } from "@/lib/video-processing";
import authConfig from "@/auth"
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params;
  try {
    console.log(`Conversion status requested for jobId: ${params.jobId}`);
    
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const job = getConversionJob(params.jobId);
    
    if (!job) {
      console.log(`Job not found: ${params.jobId}`);
      return NextResponse.json(
        { 
          error: "Conversion job not found or expired",
          jobId: params.jobId,
          message: "This conversion job may have expired or never existed. Please try uploading the video again."
        },
        { status: 404 }
      );
    }
    
    console.log(`Job ${params.jobId} status: ${job.status}, progress:`, job.progress);
    
    const response = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      completed: job.status === 'completed',
      failed: job.status === 'failed',
      error: job.error,
      startTime: job.startTime,
      lastUpdate: job.lastUpdate,
      movieId: job.movieId,
      message: undefined as string | undefined
    };
    
    // Add completion details if job is completed
    if (job.status === 'completed' || job.status === 'failed') {
      const qualities = Object.keys(job.progress);
      (response as any).qualities = qualities;
      
      if (job.status === 'completed') {
        response.message = `Video conversion completed successfully. Available qualities: ${qualities.join(', ')}`;
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error getting conversion status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}