"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  emailVerified?: Date | null
  createdAt?: Date | null
}

interface AccountStats {
  createdAt: Date
  updatedAt: Date
  activeSessions: number
  connectedAccounts: number
}

interface AccountOverviewProps {
  user: User
}

export function AccountOverview({ user }: AccountOverviewProps) {
  const [stats, setStats] = useState<AccountStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleanupLoading, setCleanupLoading] = useState(false)

  useEffect(() => {
    fetchAccountStats()
  }, [])

  const fetchAccountStats = async () => {
    try {
      const response = await fetch('/api/user/account-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch account stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupSessions = async () => {
    setCleanupLoading(true)
    try {
      const response = await fetch('/api/user/sessions/cleanup', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchAccountStats() // Refresh stats
      }
    } catch (error) {
      console.error('Failed to cleanup sessions:', error)
      alert('Failed to cleanup expired sessions')
    } finally {
      setCleanupLoading(false)
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Account Overview</h2>
          <p className="text-sm text-muted-foreground">
            Summary of your FSP account information
          </p>
        </div>
        <Button 
          onClick={handleCleanupSessions}
          disabled={cleanupLoading}
          variant="outline"
          size="sm"
        >
          {cleanupLoading ? 'Cleaning...' : 'Cleanup Expired Sessions'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Account Status */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.emailVerified ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {user.emailVerified ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-foreground">Account Status</h3>
              <p className={`text-sm ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.emailVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>

        {/* Member Since */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-foreground">Member Since</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(stats?.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-foreground">Active Sessions</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.activeSessions || 0} sessions
              </p>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-foreground">Connected Accounts</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.connectedAccounts || 0} providers
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-foreground">Last Updated</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(stats?.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}