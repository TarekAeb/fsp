"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth"
import { getServerSession } from "next-auth";
import Image from "next/image";
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  emailVerified?: Date | null;
}


export function DashboardHeader({user}: { user: User }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/dashboard/profile") return "Profile";
    if (pathname === "/dashboard/account") return "Account Settings";
    if (pathname === "/dashboard/security") return "Security";
    if (pathname === "/dashboard/notifications") return "Notifications";
    if (pathname === "/admin") return "Admin Panel";
    return "FSP Dashboard";
  };

  return (
    <header className="bg-background   shadow-sm fixed top-0 left-0 w-full h-20 z-50">
      <div className="px-6 py-4 h-[100%]">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 h-full">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-14">
                <img src="/icons/full logo colored.svg" alt="" className="h-full"/>
              </div>
            </Link>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-medium text-foreground">
              {getPageTitle()}
            </h2>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8  rounded-full flex items-center justify-center">
                  <img src="/icons/bold profile colored.svg" alt="" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-foreground font-medium">
                  {user.name || "User"}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 z-50 border border-border">
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  onClick={() => setDropdownOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="/dashboard/account"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                  onClick={() => setDropdownOpen(false)}
                >
                  Account Settings
                </Link>
                {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                  <Link
                    href="/dashboard-admin/admin"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <hr className="my-1 border-border" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
