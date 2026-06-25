import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/** Returns the current session (or null). Server-only. */
export async function getCurrentSession() {
  return getServerSession(authOptions);
}

/** Returns the full DB user for the current session, or null. */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) throw new Error("FORBIDDEN");
  return user;
}

export function isAdmin(role?: Role | null): boolean {
  return role === "ADMIN";
}
