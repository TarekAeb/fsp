import { requireRole } from "@/lib/rbac"
import { AdminDashboard } from "@/components/Dashboard-admin/admin-dashboard"

export default async function AdminPage() {
  await requireRole(["ADMIN", "MODERATOR"])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </div>
  )
}