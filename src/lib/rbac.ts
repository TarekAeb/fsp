import authConfig from "@/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
export type Role = "USER" | "ADMIN" | "MODERATOR"

export const PERMISSIONS = {
  USER: {
    canViewProfile: true,
    canEditProfile: true,
    canDeleteAccount: true,
  },
  MODERATOR: {
    canViewProfile: true,
    canEditProfile: true,
    canDeleteAccount: true,
    canModerateContent: true,
    canViewUserList: true,
  },
  ADMIN: {
    canViewProfile: true,
    canEditProfile: true,
    canDeleteAccount: true,
    canModerateContent: true,
    canViewUserList: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageSystem: true,
  },
} as const

export function hasPermission(userRole: Role, permission: string): boolean {
  const rolePermissions = PERMISSIONS[userRole]
  return rolePermissions && (rolePermissions as any)[permission] === true
}

export async function requireRole(requiredRole: Role | Role[]) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true
    }
  })
  const userRole = user?.role as Role
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!allowedRoles.includes(userRole)) {
    redirect("/unauthorized")
  }

  return session
}

export async function requirePermission(permission: string) {
  const session = await getServerSession(authConfig)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userRole = session.user.role as Role
  
  if (!hasPermission(userRole, permission)) {
    redirect("/unauthorized")
  }

  return session
}