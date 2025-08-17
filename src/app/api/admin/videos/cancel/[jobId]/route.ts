// src/app/api/admin/videos/cancel/[jobId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConversionJob } from "@/lib/video-processing";
import authConfig from "@/auth"
import { getServerSession } from "next-auth";

export async function POST(
  req: NextRequest,
  context :{params: Promise<{ jobId: string }>},
) {
    const {jobId} = await context.params;
  try {

    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const job = getConversionJob(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: "Conversion job not found" },
        { status: 404 }
      );
    }
    
    // Mark job as cancelled
    job.status = 'failed';
    job.error = 'Cancelled by user';
    
    return NextResponse.json({
      message: "Conversion cancelled successfully",
      jobId: jobId
    });
    
  } catch (error) {
    console.error("Error cancelling conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}