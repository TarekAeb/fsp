"use client"
import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"

export function useSessionValidator() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Check session validity every 30 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/session')
          if (!response.ok || response.status === 401) {
            console.log("Session invalidated, signing out")
            await signOut({ redirect: true, callbackUrl: "/auth/signin" })
          }
        } catch (error) {
          console.error("Session validation error:", error)
        }
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [session, status])

  return { session, status }
}