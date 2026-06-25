import "server-only";
import { getCurrentSession } from "@/lib/session";

/** Throws the standard error strings handled by `handleError`. */
export async function assertAdmin() {
  const session = await getCurrentSession();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session.user;
}
