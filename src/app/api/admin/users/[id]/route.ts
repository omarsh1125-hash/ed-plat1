import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { ok, fail, handleError } from "@/lib/api";

const schema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await assertAdmin();
    const data = schema.parse(await req.json());

    // Prevent an admin from locking themselves out.
    if (admin.id === params.id && (data.role === "STUDENT" || data.active === false)) {
      return fail("CANNOT_MODIFY_SELF", 400);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, role: true, active: true },
    });
    return ok(user);
  } catch (err) {
    return handleError(err);
  }
}
