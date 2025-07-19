import { auth } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/unauthorized")
  }
  return user
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN)
}

export function isAdmin(user: any): boolean {
  return user?.role === UserRole.ADMIN
}

export function isClient(user: any): boolean {
  return user?.role === UserRole.CLIENT
}