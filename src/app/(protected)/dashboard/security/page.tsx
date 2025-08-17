import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { PasswordChangeForm } from "@/components/dashboard/password-change-form"
import { TwoFactorSetup } from "@/components/dashboard/two-factor-setup"
// import { SecurityLog } from "@/components/dashboard/security-log"

export default async function SecurityPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your FSP account security and privacy settings
          </p>
        </div>
      </div>

      {/* Security Sections */}
      <div className="space-y-8">
        <PasswordChangeForm />
        <TwoFactorSetup />
        {/* <SecurityLog /> */}
      </div>
    </div>
  )
}