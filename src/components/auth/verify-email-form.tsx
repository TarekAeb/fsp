"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export function VerifyEmailForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = searchParams?.get("token");

  useEffect(() => {
    if (token) {
      console.log("Token found in URL:", token);
      verifyEmail(token);
    } else {
      console.log("No token found in URL");
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      console.log(
        "Sending verification request with token:",
        verificationToken
      );

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      console.log("Verification response status:", response.status);
      const data = await response.json();
      console.log("Verification response data:", data);

      if (response.ok) {
        setMessage(data.message || "Email verified successfully!");
        setVerificationComplete(true);

        // Wait a bit before redirecting
        setTimeout(() => {
          if (session) {
            // If user is logged in, redirect to dashboard
            router.push("/dashboard?verified=true");
          } else {
            // If not logged in, redirect to sign in
            router.push(
              "/auth/signin?message=Email verified successfully. Please sign in."
            );
          }
        }, 2000);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message || "Verification email sent! Check your inbox."
        );
        setEmail("");
      } else {
        setError(data.error || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setError("An error occurred while sending verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push("/auth/signin");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Loading State
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black before:to-transparent before:z-0">
        {/* Logo */}
        <div className="z-10 lg:self-start mb-8 lg:pl-28">
          <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
        </div>

        {/* Loading Content */}
        <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
          <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
            <div className="text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Verifying Your Email
              </h2>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-300">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification Complete Success State
  if (verificationComplete) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black before:to-transparent before:z-0">
        {/* Success Content */}
        <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
          <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Email Verified!
              </h2>
              <p className="text-gray-300 mb-6">
                Congratulations! Your Frame account is now fully activated.
              </p>
            </div>

            {message && (
              <div className="p-4 mb-6 bg-green-900/50 border border-green-600 rounded-lg">
                <div className="flex items-center text-green-400">
                  <svg
                    className="w-5 h-5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                Welcome to Frame!
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Your account is now verified and you have access to all
                features:
              </p>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center">
                  <span className="text-primary mr-2">✓</span>
                  Stream exclusive FSP content
                </li>
                <li className="flex items-center">
                  <span className="text-primary mr-2">✓</span>
                  Create personalized watchlists
                </li>
                <li className="flex items-center">
                  <span className="text-primary mr-2">✓</span>
                  Rate and review movies
                </li>
                <li className="flex items-center">
                  <span className="text-primary mr-2">✓</span>
                  Get personalized recommendations
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              {session ? (
                <button
                  onClick={handleGoToDashboard}
                  className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={handleBackToSignIn}
                  className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors"
                >
                  🍿 Sign In to Your Account
                </button>
              )}

              <Link
                href="/"
                className="block w-full h-12 py-3 px-4 text-center bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black transition-colors"
              >
                Browse Movies
              </Link>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-500 text-xs">
                🎭 The show must go on! Welcome to Frame! 🎭
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Verification Page (No token or need to resend)
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
            <h2 className="text-4xl font-bold text-white mb-4">
              {token ? "Verifying Email..." : "Email Verification"}
            </h2>
            <p className="text-gray-300">
              {token
                ? "We're processing your email verification..."
                : "Need to verify your email address?"}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 mb-6 bg-red-900/50 border border-red-600 rounded-lg">
              <div className="flex items-center text-red-400">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message Display */}
          {message && !verificationComplete && (
            <div className="p-4 mb-6 bg-green-900/50 border border-green-600 rounded-lg">
              <div className="flex items-center text-green-400">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Resend Email Form */}
          {!token && (
            <div className="space-y-6">
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Verification Email"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleBackToSignIn}
              className="w-full h-12 py-3 px-4 bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black transition-colors"
            >
              Back to Sign In
            </button>

            <div className="text-center">
              <Link
                href="/auth/signup"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Need to create an account?
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">
              Having trouble? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
