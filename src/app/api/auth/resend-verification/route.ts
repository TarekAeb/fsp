import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { VerificationService } from "@/lib/verification-service"

const resendSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = resendSchema.parse(body)

    const result = await VerificationService.sendVerificationEmail(email)

    if (result.success) {
      return NextResponse.json({
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}