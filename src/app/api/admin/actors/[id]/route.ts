import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/database";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/uploadImage"; // Create this utility

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const actorId = Number(id);
    const name = formData.get("name") as string;
    const nationality = formData.get("nationality") as string;
    const birthDate = formData.get("birthDate") as string;
    const bio = formData.get("bio") as string;
    const photo = formData.get("photo") as File | null;

    // Get current actor to check if we need to update the photo
    const currentActor = await db
      .selectFrom("Actor")
      .select(["photoUrl"])
      .where("id", "=", actorId)
      .executeTakeFirst();

    let photoUrl = currentActor?.photoUrl || null;

    // Upload new photo if provided
    if (photo) {
      photoUrl = await uploadImage(photo, "actors");
    }

    // Update actor in database
    await db
      .updateTable("Actor")
      .set({
        name,
        nationality,
        dateBirth: new Date(birthDate),
        bio,
        photoUrl,
      })
      .where("id", "=", actorId)
      .execute();

    revalidatePath("/admin/actors");

    return NextResponse.json({
      message: "Actor updated successfully",
    });
  } catch (error) {
    console.error("Error updating actor:", error);
    return NextResponse.json(
      { error: "Failed to update actor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const urlParts = request.url.split("/");
    const actorId = urlParts[urlParts.length - 1];

    if (!actorId) {
      return NextResponse.json(
        { error: "actor ID is required" },
        { status: 400 }
      );
    }

    await db.deleteFrom("Actor").where("id", "=", Number(actorId)).execute();

    revalidatePath("/admin/actors");

    return NextResponse.json({
      message: "Actor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting actor:", error);
    return NextResponse.json(
      { error: "Failed to delete actor" },
      { status: 500 }
    );
  }
}
