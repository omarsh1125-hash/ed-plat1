import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { moduleSchema } from "@/lib/validators";
import { created, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
    const data = moduleSchema.parse(await req.json());
    const count = await prisma.module.count({ where: { courseId: data.courseId } });
    const module = await prisma.module.create({
      data: {
        courseId: data.courseId,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        order: data.order ?? count,
      },
    });
    return created(module);
  } catch (err) {
    return handleError(err);
  }
}
