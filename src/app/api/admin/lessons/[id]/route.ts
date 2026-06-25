import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { lessonSchema } from "@/lib/validators";
import { ok, handleError } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertAdmin();
    const data = lessonSchema.partial().parse(await req.json());
    const { moduleId, ...rest } = data;
    const lesson = await prisma.lesson.update({ where: { id: params.id }, data: rest });
    return ok(lesson);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertAdmin();
    await prisma.lesson.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
