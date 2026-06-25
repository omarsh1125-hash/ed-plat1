import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ok, handleError } from "@/lib/api";

const noteSchema = z.object({ body: z.string().max(5000) });

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const { body } = noteSchema.parse(await req.json());

    // One note per user per lesson (simple personal note model).
    const existing = await prisma.note.findFirst({
      where: { userId: user.id, lessonId: params.id },
    });

    const note = existing
      ? await prisma.note.update({ where: { id: existing.id }, data: { body } })
      : await prisma.note.create({ data: { userId: user.id, lessonId: params.id, body } });

    return ok({ id: note.id, body: note.body });
  } catch (err) {
    return handleError(err);
  }
}
