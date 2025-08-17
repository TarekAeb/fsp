import { signOut } from "next-auth/react"
import Link from "next/link"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  emailVerified?: Date | null
}

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/profile"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome back, {user.name || user.email}!
              </h2>
              
              {!user.emailVerified && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700">
                    Please verify your email address to access all features.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/profile"
                  className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-blue-900">Profile Settings</h3>
                  <p className="text-blue-700">Manage your account information</p>
                </Link>

                {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                  <Link
                    href="/admin"
                    className="block p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-purple-900">Admin Panel</h3>
                    <p className="text-purple-700">Manage users and system settings</p>
                  </Link>
                )}

                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                  <p className="text-gray-700">
                    Role: <span className="font-medium">{user.role}</span>
                  </p>
                  <p className="text-gray-700">
                    Email: <span className={user.emailVerified ? "text-green-600" : "text-yellow-600"}>
                      {user.emailVerified ? `Verified on ${user.emailVerified.toLocaleDateString()}` : "Not Verified"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}