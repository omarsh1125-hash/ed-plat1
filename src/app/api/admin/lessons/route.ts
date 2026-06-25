import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { lessonSchema } from "@/lib/validators";
import { created, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
    const data = lessonSchema.parse(await req.json());
    const count = await prisma.lesson.count({ where: { moduleId: data.moduleId } });
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: data.moduleId,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        type: data.type,
        contentUrl: data.contentUrl ?? null,
        bodyEn: data.bodyEn ?? null,
        bodyAr: data.bodyAr ?? null,
        durationMinutes: data.durationMinutes ?? 0,
        isPreview: data.isPreview ?? false,
        order: data.order ?? count,
      },
    });
    return created(lesson);
  } catch (err) {
    return handleError(err);
  }
}
