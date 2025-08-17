import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { AccountOverview } from "@/components/dashboard/account-overview"
import { SessionManagement } from "@/components/dashboard/session-management"
import { DangerZone } from "@/components/dashboard/danger-zone"
import { prisma } from "@/lib/prisma"

export default async function AccountPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/auth/signin")
  }
  
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
    redirect("/auth/signin")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your FSP account preferences and data
          </p>
        </div>
      </div>

      {/* Account Sections */}
      <div className="space-y-8">
        <AccountOverview user={user} />
        <SessionManagement />
        <DangerZone user={user} />
      </div>
    </div>
  )
}