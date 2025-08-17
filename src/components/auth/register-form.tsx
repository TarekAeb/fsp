"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRef } from "react";
import Image from "next/image";
interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Use ref instead
  const router = useRouter();

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      console.log("Username check response:", data);
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Username check error:", error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    handleInputChange("username", value);

    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Set new timeout
    usernameCheckTimeoutRef.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          username: formData.username.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setUserEmail(formData.email.trim());
      } else {
        setErrors({ general: data.error || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "An error occurred during registration" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage(
          "Verification email sent successfully! Check your inbox."
        );
      } else {
        setResendMessage(data.error || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setResendMessage("An error occurred while sending verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign up error:", error);
    }
  };

  const handleBackToSignIn = () => {
    router.push("/auth/signin");
  };

  // Success/Verification Page
  if (success) {
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

        {/* Verification Page */}
        <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
          <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Check Your Email!
              </h2>
              <p className="text-gray-300 mb-2">
                We&apos;ve sent a verification link to:
              </p>
              <p className="text-primary font-semibold text-lg mb-6">
                {userEmail}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  Next Steps:
                </h3>
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here and sign in to start streaming!</li>
                </ol>
              </div>

              {/* Resend Verification */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Didn&apos;t receive the email?
                </p>

                {resendMessage && (
                  <div
                    className={`p-3 rounded-md mb-4 ${
                      resendMessage.includes("successfully")
                        ? "bg-green-900/50 border border-green-800 text-green-400"
                        : "bg-red-900/50 border border-red-800 text-red-400"
                    }`}
                  >
                    <p className="text-sm">{resendMessage}</p>
                  </div>
                )}

                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full h-12 py-3 px-4 bg-background text-white border border-gray-600 rounded-xs hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                >
                  {resendLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBackToSignIn}
                  className="w-full h-14 py-3 px-4 bg-primary text-black text-lg font-medium rounded-xs hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors"
                >
                  Go to Sign In
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-gray-500 text-xs">
                  Having trouble? Contact our support team for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10 lg:pt-14 gap-20 lg:gap-28 bg-black/15 z-0 bg-[url('/images/MOVIE2.png')] bg-cover bg-center relative overflow-hidden">
      {/* Logo */}
      <div className="z-10 lg:self-start mb-8 lg:pl-28">
        <img src="/icons/full logo colored.svg" alt="" className="max-h-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl px-4 lg:px-0">
        {/* Registration Form */}
        <div className="bg-card/70 backdrop-blur-sm rounded-xs p-8">
          <h2 className="text-5xl font-bold text-white text-center mb-8">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {/* Name Field */}
              <div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Full Name"
                  className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                    errors.name
                      ? "ring-1 ring-red-500 focus:ring-red-500"
                      : "focus:ring-primary"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  placeholder="Username"
                  className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                    errors.username
                      ? "ring-1 ring-red-500 focus:ring-red-500"
                      : usernameAvailable === false
                      ? "ring-1 ring-red-500 focus:ring-red-500"
                      : usernameAvailable === true
                      ? "ring-1 ring-green-500 focus:ring-green-500"
                      : "focus:ring-primary"
                  }`}
                />
                {/* Username status indicator */}
                {formData.username.length >= 3 && (
                  <div className="mt-1 flex items-center text-sm">
                    {usernameChecking ? (
                      <span className="text-gray-400">
                        Checking availability...
                      </span>
                    ) : usernameAvailable === true ? (
                      <span className="text-green-400">
                        ✓ Username available
                      </span>
                    ) : usernameAvailable === false ? (
                      <span className="text-red-400">
                        ✗ Username already taken
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="Email Address"
                className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                  errors.email
                    ? "ring-1 ring-red-500 focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="Password"
                className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                  errors.password
                    ? "ring-1 ring-red-500 focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                required
                placeholder="Confirm Password"
                className={`w-full px-4 py-3 bg-background rounded-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-transparent transition-colors ${
                  errors.confirmPassword
                    ? "ring-1 ring-red-500 focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                By signing up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-md bg-red-900/50 border border-red-800">
                <p className="text-red-400 text-sm">{errors.general}</p>
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
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Google Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">OR</p>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-14 flex justify-center gap-2 items-center text-lg py-3 px-4 bg-foreground text-muted-foreground font-medium rounded-xs hover:bg-background focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-primary focus:ring-offset-black transition-colors"
            >
              <img src="/icons/google.svg" alt="google" className="h-8 w-8" />
              Sign up with Google
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
