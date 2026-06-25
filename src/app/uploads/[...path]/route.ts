import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
//  Serves files written by the local storage driver. Next.js only serves
//  files that exist in `public/` at build time, so files uploaded at runtime
//  (admin media uploads) are streamed through this handler instead of relying
//  on static asset serving. When STORAGE_DRIVER=s3 this route is unused — the
//  storage layer returns absolute object-store URLs directly.
// ---------------------------------------------------------------------------

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || "public/uploads";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".txt": "text/plain; charset=utf-8",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path || [];
  // Reject path traversal / absolute escapes.
  if (segments.some((s) => s === ".." || s.includes("\\") || s.includes("\0"))) {
    return new Response("Bad request", { status: 400 });
  }

  const baseDir = path.resolve(process.cwd(), UPLOAD_DIR);
  const filePath = path.resolve(baseDir, ...segments);
  if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
