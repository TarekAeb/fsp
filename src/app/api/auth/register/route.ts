import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { VerificationService } from "@/lib/verification-service"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"), // Updated to match your frontend
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Registration request:", { ...body, password: "[REDACTED]" })
    
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      const errors = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      console.log("Validation failed:", errors)
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      )
    }

    const { name, username, email, password } = validation.data

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      console.log("Email already exists:", email)
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      console.log("Username already exists:", username)
      return NextResponse.json(
        { error: "This username is already taken. Please choose a different one." },
        { status: 400 }
      )
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcryptjs.hash(password, 14)

    // Create user with separate name and username fields
    const user = await prisma.user.create({
      data: {
        name: name,           
        username: username,   
        email,
        password: hashedPassword,
        emailVerified: null,  
        role: "USER",         
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    console.log("User created successfully:", { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    })

    // Send verification email using the full name
    const verificationResult = await VerificationService.sendVerificationEmail(email, name)

    if (verificationResult.success) {
      return NextResponse.json({
        message: "Account created successfully! Please check your email to verify your account before signing in.",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        verificationSent: true,
      }, { status: 201 })
    } else {
      console.error("Failed to send verification email:", verificationResult.error)
      return NextResponse.json({
        message: "Account created successfully, but failed to send verification email. You can request a new verification email from the sign-in page.",
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        verificationSent: false,
      }, { status: 201 })
    }
  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('username')) {
        return NextResponse.json(
          { error: "This username is already taken. Please choose a different one." },
          { status: 400 }
        )
      }
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    )
  }
}