import { SessionStore } from "./session-store"

// Run this periodically (e.g., via cron job or background task)
export async function cleanupExpiredSessions() {
  try {
    const cleaned = await SessionStore.cleanupExpiredSessions()
    console.log(`Cleaned up ${cleaned} expired sessions`)
    return cleaned
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error)
    return 0
  }
}

// Example: Run cleanup every hour
if (process.env.NODE_ENV === "production") {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000) // 1 hour
}