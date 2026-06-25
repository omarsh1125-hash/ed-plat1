import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireUser } from "@/lib/session";
import { profileSchema, changePasswordSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const data = profileSchema.parse(await req.json());
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name.trim(),
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl || null,
        ...(data.locale ? { locale: data.locale } : {}),
      },
      select: { id: true, name: true, bio: true, avatarUrl: true, locale: true },
    });
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

// Password change is a separate concern under the same resource.
export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await requireUser();
    const data = changePasswordSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) return fail("NOT_FOUND", 404);

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return fail("INVALID_PASSWORD", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(data.newPassword) },
    });
    return ok({ updated: true });
  } catch (err) {
    return handleError(err);
  }
}
