"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address")
      setIsSuccess(false)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setIsSuccess(true)
        setEmail("")
      } else {
        setMessage(data.error || "An error occurred")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setMessage("An error occurred. Please try again.")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear messages when user starts typing
    if (message) {
      setMessage("")
    }
  }

  // Success State
  if (isSuccess && message) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black before:to-transparent before:z-0">
        {/* Logo */}
        <div className="z-10 lg:self-start mb-8 lg:pl-28">
          <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
        </div>
        
        {/* Success Content */}
        <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
          <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Check Your Email!</h2>
              <p className="text-gray-300 mb-6">
                We&apos;ve sent password reset instructions to your email address.
              </p>
            </div>

            <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-6">
              <div className="flex items-center text-green-400">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                Next Steps:
              </h3>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>Choose a new strong password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors text-center"
              >
                Back to Sign In
              </Link>
              
              <button
                onClick={() => {
                  setIsSuccess(false)
                  setMessage("")
                }}
                className="w-full h-12 py-3 px-4 bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black transition-colors"
              >
                Send Another Reset Email
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-500 text-xs">
                Reset links expire after 1 hour for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Forgot Password Form
  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black before:to-transparent before:z-0">
      {/* Logo */}
      <div className="z-10 lg:self-start mb-8 lg:pl-28">
        <Link href={"/"} className="flex items-center">
        <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
        </Link>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
        <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">Forgot Your Password?</h2>
            <p className="text-gray-300">
              No worries! Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                  message && !isSuccess 
                    ? 'ring-1 ring-red-500 focus:ring-red-500' 
                    : 'focus:ring-primary'
                }`}
              />
              <p className="mt-1 text-xs text-gray-400">
                We&apos;ll send reset instructions to this email
              </p>
            </div>

            {/* Error Message */}
            {message && !isSuccess && (
              <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
                <div className="flex items-center text-red-400">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                "📧 Send Reset Link"
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-8 space-y-3">
            <p className="text-gray-300 text-sm text-center">
              For your security, we&apos;ll only send reset links to registered email addresses.
              If you don&apos;t receive an email, the address might not be associated with a Frame account.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full h-12 py-3 px-4 bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black transition-colors text-center"
            >
              Back to Sign In
            </Link>

            <div className="text-center gap-2 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Don&apos;t have an account?</p>
              <Link
                href="/auth/signup"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Create a Frame account
              </Link>
            </div>
          </div>

          {/* Help Text */}
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