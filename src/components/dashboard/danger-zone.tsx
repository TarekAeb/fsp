"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"

interface User {
  id: string
  name?: string | null
  email?: string | null
}

interface DangerZoneProps {
  user: User
}

export function DangerZone({ user }: DangerZoneProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState("")

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setMessage("Please type DELETE to confirm")
      return
    }

    setIsDeleting(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        // Account deleted successfully, sign out user
        await signOut({ callbackUrl: "/?message=Account deleted successfully" })
      } else {
        setMessage(data.error || "Failed to delete account")
      }
    } catch (error) {
      setMessage("An error occurred while deleting account")
    } finally {
      setIsDeleting(false)
    }
  }

  const deactivateAllSessions = async () => {
    try {
      const response = await fetch("/api/user/deactivate-sessions", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("All sessions have been deactivated. You will be signed out.")
        setTimeout(() => {
          signOut({ callbackUrl: "/auth/signin?message=All sessions deactivated" })
        }, 2000)
      } else {
        setMessage(data.error || "Failed to deactivate sessions")
      }
    } catch (error) {
      setMessage("An error occurred while deactivating sessions")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-400 p-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          <p className="text-sm text-red-700 mt-1">
            These actions are irreversible. Please proceed with caution.
          </p>
          
          <div className="mt-6 space-y-6">
            {/* Deactivate Sessions */}
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Deactivate All Sessions</h3>
                <p className="text-sm text-gray-500">
                  Sign out from all devices and browsers
                </p>
              </div>
              <button
                onClick={deactivateAllSessions}
                className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Deactivate All
              </button>
            </div>

            {/* Delete Account */}
            <div className="p-4 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">
                    Permanently delete your FSP account and all associated data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Delete Account
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-900 mb-2">
                    Are you absolutely sure?
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    This action cannot be undone. This will permanently delete your account 
                    and remove your data from our servers.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-red-700">
                        Type <strong>DELETE</strong> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="DELETE"
                      />
                    </div>
                    
                    {message && (
                      <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                        <p className="text-sm text-red-700">{message}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirmText !== "DELETE"}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDeleting ? "Deleting..." : "I understand, delete my account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText("")
                          setMessage("")
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}