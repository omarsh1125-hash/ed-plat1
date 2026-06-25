import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { ok, handleError } from "@/lib/api";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertAdmin();
    await prisma.attachment.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
