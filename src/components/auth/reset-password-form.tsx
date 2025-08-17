"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Clear errors when user starts typing
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid reset token");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push(
            "/auth/signin?message=Password reset successful! You can now sign in with your new password."
          );
        }, 2000);
      } else {
        setError(data.error || "Password reset failed");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("An error occurred during password reset");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid Token State
  if (!token) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-black before:to-transparent before:z-0">
        {/* Logo */}
        <div className="z-10 lg:self-start mb-8 lg:pl-28">
          <Link href={"/"} className="flex items-center">
            <img
              src="/icons/full logo colored.svg"
              alt=""
              className="max-h-12"
            />
          </Link>
        </div>

        {/* Invalid Token Content */}
        <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
          <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-300 mb-6">
                This password reset link is invalid, expired, or has already
                been used.
              </p>
            </div>

            <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
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
                <span className="text-sm font-medium">
                  Invalid or missing reset token
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors text-center"
              >
                Request New Password Reset
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
                Reset links expire after 1 hour for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden">
        {/* Logo */}
        <div className="z-10 lg:self-start mb-8 lg:pl-28">
          <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
        </div>

        {/* Success Content */}
        <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
          <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Password Reset!
              </h2>
              <p className="text-gray-300 mb-6">
                Your password has been successfully updated.
              </p>
            </div>

            <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-6">
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
                <span className="text-sm font-medium">{success}</span>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                Ready to Get Back to Streaming!
              </h3>
              <p className="text-gray-300 text-sm">
                You can now sign in with your new password and continue enjoying
                Frame&apos;s exclusive content.
              </p>
            </div>

            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-gray-400">Redirecting to sign in...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Reset Form
  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-24 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden">
      {/* Logo */}
      <div className="z-10 lg:self-start mb-8 lg:pl-28">
        <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
        <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Reset Your Password
            </h2>
            <p className="text-gray-300">
              Choose a strong new password for your Frame account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Enter your new password"
                className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                  error && error.includes("Password")
                    ? "ring-1 ring-red-500 focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              <p className="mt-1 text-xs text-gray-400">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Confirm your new password"
                className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                  error && error.includes("match")
                    ? "ring-1 ring-red-500 focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                <p className="text-xs text-gray-300 mb-2">Password Strength:</p>
                <div className="space-y-1">
                  <div
                    className={`text-xs ${
                      formData.password.length >= 8
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.password.length >= 8 ? "✓" : "○"} At least 8
                    characters
                  </div>
                  <div
                    className={`text-xs ${
                      /[A-Z]/.test(formData.password)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {/[A-Z]/.test(formData.password) ? "✓" : "○"} One uppercase
                    letter (recommended)
                  </div>
                  <div
                    className={`text-xs ${
                      /[0-9]/.test(formData.password)
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {/[0-9]/.test(formData.password) ? "✓" : "○"} One number
                    (recommended)
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Navigation */}
          <div className="mt-8 space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full h-12 py-3 px-4 bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black transition-colors text-center"
            >
              Back to Sign In
            </Link>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Need a new reset link?
              </Link>
            </div>
          </div>

          {/* Security Note */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">
              Your password is encrypted and secure with Frame.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
