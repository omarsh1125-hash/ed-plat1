import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { created, fail, handleError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("EMAIL_IN_USE", 409);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash: await hashPassword(data.password),
        role: "STUDENT",
      },
      select: { id: true, name: true, email: true },
    });

    return created(user);
  } catch (err) {
    return handleError(err);
  }
}
