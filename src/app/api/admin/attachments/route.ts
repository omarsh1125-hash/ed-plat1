import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { attachmentSchema } from "@/lib/validators";
import { created, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
    const data = attachmentSchema.parse(await req.json());
    const attachment = await prisma.attachment.create({
      data: {
        lessonId: data.lessonId,
        titleEn: data.titleEn,
        titleAr: data.titleAr,
        url: data.url,
        fileType: data.fileType ?? null,
        isExternal: data.isExternal ?? false,
      },
    });
    return created(attachment);
  } catch (err) {
    return handleError(err);
  }
}
