import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { requireRole } from "@/lib/rbac"
import Sidebar from "@/components/Dashboard-admin/Sidebar"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated and has admin role
  await requireRole("ADMIN")

  return (
    <div className="flex min-h-screen bg-background text-muted-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}