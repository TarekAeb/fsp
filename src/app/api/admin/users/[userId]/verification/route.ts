import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const updateVerificationSchema = z.object({
  verified: z.boolean(),
});

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireRole(["ADMIN", "MODERATOR"]);
    const userId = id;
    const body = await req.json();
    const { verified } = updateVerificationSchema.parse(body);

    // Update user email verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: verified ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      message: `User verification ${
        verified ? "enabled" : "disabled"
      } successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin update verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
