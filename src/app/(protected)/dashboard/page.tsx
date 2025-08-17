import  authConfig  from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authConfig)

  console.log("Dashboard Page - Session:", {
    hasSession: !!session,
    userId: session?.user?.id
  })

  if (!session?.user?.id) {
    console.log("No session in dashboard page, redirecting to signin")
    redirect("/auth/signin")
  }

  // Redirect to profile instead of trying to render here
  redirect("/dashboard/profile")
}