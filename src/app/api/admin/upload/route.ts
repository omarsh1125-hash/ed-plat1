import { NextRequest } from "next/server";
import { assertAdmin } from "@/lib/adminGuard";
import { getStorage, isAllowedMime, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { created, fail, handleError } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const admin = await assertAdmin();
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) return fail("NO_FILE", 400);
    if (file.size > MAX_UPLOAD_BYTES) return fail("FILE_TOO_LARGE", 413);
    if (!isAllowedMime(file.type)) return fail("UNSUPPORTED_TYPE", 415);

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    const stored = await storage.save({
      buffer,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
    });

    await prisma.uploadedFile.create({
      data: {
        key: stored.key,
        url: stored.url,
        fileName: stored.fileName,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        driver: stored.driver,
        uploadedBy: admin.id,
      },
    });

    return created({ url: stored.url, fileName: stored.fileName, mimeType: stored.mimeType, sizeBytes: stored.sizeBytes });
  } catch (err) {
    return handleError(err);
  }
}
