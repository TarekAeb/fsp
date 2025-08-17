"use client"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Session {
  id: string
  sessionToken: string
  expires: Date
  createdAt: Date
  updatedAt: Date
  isCurrent: boolean
  rememberMe?: boolean
}

interface SessionsData {
  sessions: Session[]
  totalActive: number
}

export function SessionManagement() {
  const [sessionsData, setSessionsData] = useState<SessionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deactivateAllLoading, setDeactivateAllLoading] = useState(false)
  const [deactivatingSession, setDeactivatingSession] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/user/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessionsData(data)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAll = async () => {
    if (!confirm('Are you sure you want to deactivate all other sessions? This will log you out from all other devices.')) {
      return
    }

    setDeactivateAllLoading(true)
    try {
      const response = await fetch('/api/user/sessions/deactivate-all', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchSessions()
      }
    } catch (error) {
      console.error('Failed to deactivate sessions:', error)
      alert('Failed to deactivate other sessions')
    } finally {
      setDeactivateAllLoading(false)
    }
  }

  const handleDeactivateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to deactivate this session?')) {
      return
    }

    setDeactivatingSession(sessionId)
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchSessions()
        
        setTimeout(async () => {
          try {
            const validateResponse = await fetch('/api/auth/validate-session')
            if (!validateResponse.ok) {
              console.log("Current session was deactivated")
              await signOut({ redirect: true, callbackUrl: "/auth/signin" })
            }
          } catch (error) {
            console.error("Session validation error:", error)
          }
        }, 1000)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to deactivate session')
      }
    } catch (error) {
      console.error('Failed to deactivate session:', error)
      alert('Failed to deactivate session')
    } finally {
      setDeactivatingSession(null)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const sessionDate = new Date(date)
    const diffInMs = now.getTime() - sessionDate.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getSessionTypeBadge = (session: Session) => {
    if (session.isCurrent) {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          Current Session
        </span>
      )
    }
    
    if (session.rememberMe) {
      return (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          🔒 Extended Session
        </span>
      )
    }
    
    return (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
        Regular Session
      </span>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              Manage your active login sessions. You have {sessionsData?.totalActive || 0} active sessions.
              <br />
              <em className="text-xs text-yellow-600">
                💡 Extended sessions (Remember Me) last 30 days, regular sessions last 24 hours.
              </em>
            </CardDescription>
          </div>
          {sessionsData && sessionsData.totalActive > 1 && (
            <Button
              onClick={handleDeactivateAll}
              disabled={deactivateAllLoading}
              variant="destructive"
              size="sm"
            >
              {deactivateAllLoading ? 'Deactivating...' : 'Deactivate All Others'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!sessionsData || sessionsData.sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No active sessions found.</p>
            <Button onClick={fetchSessions} variant="outline">
              Refresh Sessions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessionsData.sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 border rounded-lg ${
                  session.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        Session {session.sessionToken}
                      </span>
                      {getSessionTypeBadge(session)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Created: {formatDate(session.createdAt)}</p>
                      <p>Last activity: {getTimeAgo(session.updatedAt)}</p>
                      <p>Expires: {formatDate(session.expires)}</p>
                      {session.rememberMe && (
                        <p className="text-blue-600 font-medium">
                          🔒 Extended session (30 days)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <Button
                      onClick={() => handleDeactivateSession(session.id)}
                      disabled={deactivatingSession === session.id}
                      variant="destructive"
                      size="sm"
                    >
                      {deactivatingSession === session.id ? 'Deactivating...' : 'Deactivate'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}