import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { SessionStore } from "@/lib/session-store"

export async function validateSession() {
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.id) {
    return null
  }

  // Check if the database session still exists
  const sessionId = (session as { sessionId?: string }).sessionId
  if (sessionId) {
    const dbSession = await SessionStore.getSession(sessionId)
    if (!dbSession) {
      // Session was deactivated, return null to force re-authentication
      return null
    }
  }

  return session
}