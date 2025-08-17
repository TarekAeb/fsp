"use client"
import { useEffect } from "react"
import { signOut } from "next-auth/react"

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Validate session every 60 seconds (less aggressive)
    const validateSession = async () => {
      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST'
        })
        const data = await response.json()
        
        if (!data.valid) {
          console.log("Session invalidated, signing out")
          await signOut({ redirect: true, callbackUrl: "/auth/signin" })
        }
      } catch (error) {
        console.error("Session validation error:", error)
      }
    }

    // Set up periodic validation (every 60 seconds)
    const interval = setInterval(validateSession, 60000)

    return () => clearInterval(interval)
  }, [])

  return <>{children}</>
}