"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import Image from "next/image"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "EmailNotVerified":
        return {
          title: "Email Not Verified",
          message: "Please verify your email address before signing in.",
          action: "Verify Email",
          href: "/auth/verify-email"
        }
      case "OAuthAccountNotLinked":
        return {
          title: "Account Already Exists",
          message: "An account with this email already exists. Please sign in with your original method.",
          action: "Sign In",
          href: "/auth/signin"
        }
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You don't have permission to access this application.",
          action: "Go Home",
          href: "/"
        }
      default:
        return {
          title: "Authentication Error",
          message: "Something went wrong during authentication. Please try again.",
          action: "Try Again",
          href: "/auth/signin"
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden">
      {/* Logo */}
      <div className="z-10 lg:self-start mb-8 lg:pl-28">
        <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
      </div>
      
      {/* Error Content */}
      <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
        <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-4xl font-bold text-white mb-4">{errorInfo.title}</h2>
            <p className="text-gray-300 mb-6">{errorInfo.message}</p>
          </div>

          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-400">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Error Code: {error || "Unknown"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={errorInfo.href}
              className="block w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors text-center"
            >
              {errorInfo.action}
            </Link>
            
            <Link
              href="/auth/signin"
              className="block w-full h-12 py-3 px-4 bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}