import authConfig  from "@/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  console.log("Dashboard Layout - Session:", {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  })

  if (!session?.user?.id) {
    console.log("No session in dashboard layout, redirecting to signin")
    redirect("/auth/signin")
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        emailVerified: true,
      }
    })

    if (!user) {
      console.log("User not found in database, redirecting to signin")
      redirect("/auth/signin")
    }

    console.log("Dashboard Layout - User found:", user.email)

    return (
      <div className="min-h-screen bg-background text-foreground w-full">
        <DashboardHeader user={user} />
        <div className="flex pt-20 h-screen">
          <DashboardSidebar user={user} />
          <main className="flex-1 p-8 ml-64 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard Layout error:", error)
    redirect("/auth/signin")
  }
}