"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Signing in with remember me:", rememberMe);

      const result = await signIn("credentials", {
        email,
        password,
        rememberMe: rememberMe.toString(), // Pass rememberMe as string
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        console.error("Sign in error:", result.error);
      } else if (result?.ok) {
        console.log("Sign in successful, redirecting to dashboard");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in exception:", error);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // For OAuth providers, we'll set a longer session by default
      await signIn("google", {
        callbackUrl: "/dashboard",
        // Note: OAuth providers don't support custom credentials
        // but they'll get longer sessions by default
      });
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28  z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black before:to-transparent before:z-0">
      {/* Logo */}
      <div className="z-10 lg:self-start mb-8 lg:pl-28">
        <Link href={"/"} className="flex items-center">
          <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
        {/* Login Form */}
        <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
          <h2 className="text-5xl font-bold text-white text-center mb-8">
            Log In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="username or phone"
                className="w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="password"
                className="w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-gray-600 rounded focus:ring-primary focus:ring-2 accent-primary"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-300 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-900/50 border border-red-800">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">OR</p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-14 flex justify-center gap-2 items-center text-lg py-3 px-4 bg-foreground text-muted-foreground font-medium rounded-xs hover:bg-background focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors"
            >
              <img src="/icons/google.svg" alt="google" className="h-8 w-8" />
              Sign in with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            New to Frame Plus?{" "}
            <Link
              href="/auth/signup"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
