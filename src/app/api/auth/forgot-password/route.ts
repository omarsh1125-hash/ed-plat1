import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/lib/validators";
import { ok, handleError } from "@/lib/api";

// Generates a reset token. In production this token would be emailed; here we
// return it in the response in development so the flow is testable end-to-end.
export async function POST(req: NextRequest) {
  try {
    const { email } = forgotSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    let devToken: string | undefined;
    if (user) {
      const raw = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
        },
      });
      // TODO: send `raw` via email. Exposed here only outside production.
      if (process.env.NODE_ENV !== "production") devToken = raw;
    }

    // Always return success to avoid leaking which emails exist.
    return ok({ sent: true, devToken });
  } catch (err) {
    return handleError(err);
  }
}
