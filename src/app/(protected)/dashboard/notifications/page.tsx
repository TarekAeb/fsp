import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { NotificationSettings } from "@/components/dashboard/notification-settings"

export default async function NotificationsPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage how you receive notifications from FSP
          </p>
        </div>
      </div>

      {/* Notification Settings */}
      <NotificationSettings />
    </div>
  )
}