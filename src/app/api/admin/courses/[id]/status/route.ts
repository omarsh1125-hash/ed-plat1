import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminGuard";
import { ok, handleError } from "@/lib/api";

const schema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertAdmin();
    const { status } = schema.parse(await req.json());
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
      select: { id: true, status: true },
    });
    return ok(course);
  } catch (err) {
    return handleError(err);
  }
}
