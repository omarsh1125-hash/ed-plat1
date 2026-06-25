import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { courseSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { created, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const admin = await assertAdmin();
    const data = courseSchema.parse(await req.json());

    // Ensure a unique slug.
    let base = data.slug ? slugify(data.slug) : slugify(data.titleEn) || `course-${Date.now()}`;
    let slug = base;
    let n = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }

    const course = await prisma.course.create({
      data: {
        slug,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        shortDescEn: data.shortDescEn ?? null,
        shortDescAr: data.shortDescAr ?? null,
        descriptionEn: data.descriptionEn ?? "",
        descriptionAr: data.descriptionAr ?? "",
        thumbnailUrl: data.thumbnailUrl ?? null,
        promoVideoUrl: data.promoVideoUrl ?? null,
        level: data.level,
        status: data.status ?? "DRAFT",
        durationMinutes: data.durationMinutes,
        instructorName: data.instructorName ?? null,
        isFree: data.isFree,
        price: data.isFree ? 0 : data.price,
        currency: data.currency,
        categoryId: data.categoryId || null,
        featured: data.featured ?? false,
        objectives: data.objectives ?? [],
        requirements: data.requirements ?? [],
        authorId: admin.id,
      },
    });

    return created({ id: course.id, slug: course.slug });
  } catch (err) {
    return handleError(err);
  }
}
