import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// ---------------------------------------------------------------------------
//  Storage abstraction
//  A single interface so the app never depends on *where* files live. The
//  default "local" driver writes to ./public/uploads; swapping to S3 later
//  means implementing S3Storage below and flipping STORAGE_DRIVER=s3.
// ---------------------------------------------------------------------------

export interface StoredFile {
  key: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  driver: string;
}

export interface Storage {
  driver: string;
  save(file: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}

function safeName(name: string): string {
  const ext = path.extname(name);
  const base = path
    .basename(name, ext)
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .slice(0, 60);
  const rand = crypto.randomBytes(6).toString("hex");
  return `${Date.now()}-${rand}-${base || "file"}${ext.toLowerCase()}`;
}

class LocalStorage implements Storage {
  driver = "local";
  private dir = process.env.LOCAL_UPLOAD_DIR || "public/uploads";
  private baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/uploads";

  async save(file: { buffer: Buffer; fileName: string; mimeType: string }) {
    const key = safeName(file.fileName);
    const absDir = path.resolve(process.cwd(), this.dir);
    await fs.mkdir(absDir, { recursive: true });
    await fs.writeFile(path.join(absDir, key), file.buffer);
    return {
      key,
      url: `${this.baseUrl}/${key}`,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.buffer.length,
      driver: this.driver,
    };
  }

  async delete(key: string) {
    const absDir = path.resolve(process.cwd(), this.dir);
    await fs.rm(path.join(absDir, key), { force: true });
  }
}

/**
 * S3-compatible driver placeholder. The interface is identical to LocalStorage,
 * so wiring it up later only requires adding the @aws-sdk/client-s3 dependency
 * and filling in the body — no call sites change.
 */
class S3Storage implements Storage {
  driver = "s3";
  async save(): Promise<StoredFile> {
    throw new Error(
      "S3 storage is not wired yet. Add @aws-sdk/client-s3 and implement S3Storage, then set STORAGE_DRIVER=s3."
    );
  }
  async delete(): Promise<void> {
    throw new Error("S3 storage is not wired yet.");
  }
}

let _storage: Storage | null = null;

export function getStorage(): Storage {
  if (_storage) return _storage;
  _storage = process.env.STORAGE_DRIVER === "s3" ? new S3Storage() : new LocalStorage();
  return _storage;
}

// Basic allow-list of content the platform accepts for upload.
export const ALLOWED_MIME_PREFIXES = [
  "image/",
  "video/",
  "audio/",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument", // docx, pptx, xlsx
  "application/vnd.ms-powerpoint",
  "application/msword",
  "text/plain",
];

export const MAX_UPLOAD_BYTES = 1024 * 1024 * 512; // 512 MB

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p));
}
