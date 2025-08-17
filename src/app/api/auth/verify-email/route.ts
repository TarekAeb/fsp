import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { VerificationService } from "@/lib/verification-service"

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

export async function POST(req: NextRequest) {
  try {
    console.log("=== Email Verification API Called ===")
    
    const body = await req.json()
    console.log("Request body:", body)
    
    const validationResult = verifyEmailSchema.safeParse(body)
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error)
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }
    
    const { token } = validationResult.data
    console.log("Attempting to verify token:", token)

    const result = await VerificationService.verifyEmail(token)
    console.log("Verification result:", result)

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
    console.error("Email verification API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}