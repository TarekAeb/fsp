import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/database";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/uploadImage";
import { setTimeout } from "timers/promises";

// Maximum number of retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Separate function to handle database operations with retries
async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;

      // Only retry on connection errors
      if (
        error instanceof Error &&
        (error.message.includes("ECONNRESET") ||
          error.message.includes("CONNECTION_ERROR") ||
          error.message.includes("ETIMEDOUT")) &&
        attempt < MAX_RETRIES
      ) {
        console.log(`Waiting ${RETRY_DELAY}ms before retry...`);
        await setTimeout(RETRY_DELAY);
        continue;
      }

      // For other errors or if max retries reached, throw immediately
      throw error;
    }
  }

  // This should never happen, but TypeScript wants a return here
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data once
    const formData = await request.clone().formData();
    const name = formData.get("name") as string;
    const nationality = formData.get("nationality") as string;
    const birthDate = formData.get("birthDate") as string;
    const photo = formData.get("photo") as File | null;

    // Validate required fields
    if (!name || !nationality || !birthDate) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Upload photo if provided
    let photoUrl = null;
    if (photo) {
      try {
        photoUrl = await uploadImage(photo, "directors");
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return new NextResponse(
          JSON.stringify({
            error: "Failed to upload image. Please try again.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    if(!photoUrl){
        throw new Error("Photo upload failed or no photo provided");
    }
    // Execute database operation with retries
    const result = await executeWithRetry(async () => {
      return await db.transaction().execute(async (trx) => {
        const insertResult = await trx
          .insertInto("Director")
          .values({
            name,
            nationality,
            dateBirth: new Date(birthDate),
            photoUrl,
          })
          .returning("id")
          .executeTakeFirst();

        return insertResult;
      });
    });

    // Revalidate path after successful operation
    revalidatePath("/admin/directors");

    // Return success response
    return new NextResponse(
      JSON.stringify({
        message: "Director created successfully",
        id: result?.id,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating director:", error);

    // Return error response
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create director. Please try again later.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
