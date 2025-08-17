import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ProfileSection } from "@/components/dashboard/profile-section"
import { PersonalInfoSection } from "@/components/dashboard/personal-info-section"
import { ProfilePhotoSection } from "@/components/dashboard/profile-photo-section"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
export default async function ProfilePage() {
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
        <div className="flex items-center space-x-4">
          {/* User Avatar or Initials */}
          <div className="w-16 h-16 rounded-full overflow-hidden">
            {user.image ? (
              <img src={user.image} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full  flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  <img src="/icons/bold profile colored.svg" alt="" />
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {session.user.name || "Welcome"}
            </h1>
            <p className="text-gray-500">
              Manage your FSP profile and preferences
            </p>
          </div>
        </div>
        
        
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PersonalInfoSection user={user} />
          <ProfileSection user={user} />
        </div>
        <div>
          <ProfilePhotoSection user={user} />
        </div>
      </div>
    </div>
  )
}