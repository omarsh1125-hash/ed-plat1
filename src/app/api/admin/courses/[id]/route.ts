import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { courseSchema } from "@/lib/validators";
import { ok, handleError } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertAdmin();
    const data = courseSchema.partial().parse(await req.json());

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(data.titleEn !== undefined && { titleEn: data.titleEn }),
        ...(data.titleAr !== undefined && { titleAr: data.titleAr }),
        ...(data.shortDescEn !== undefined && { shortDescEn: data.shortDescEn }),
        ...(data.shortDescAr !== undefined && { shortDescAr: data.shortDescAr }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
        ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
        ...(data.promoVideoUrl !== undefined && { promoVideoUrl: data.promoVideoUrl }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.instructorName !== undefined && { instructorName: data.instructorName }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.price !== undefined && { price: data.isFree ? 0 : data.price }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.objectives !== undefined && { objectives: data.objectives }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
      },
    });

    return ok({ id: course.id });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertAdmin();
    await prisma.course.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
