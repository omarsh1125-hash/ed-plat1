import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getPaymentProvider } from "@/lib/payments";
import { ok, created, fail, notFound, handleError } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireUser();
    const localeHint = (await req.json().catch(() => ({})))?.locale || "en";

    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course || course.status !== "PUBLISHED") return notFound("COURSE_NOT_FOUND");

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (existing) return ok({ enrolled: true, alreadyEnrolled: true });

    // Paid course → run through the payment provider (stub grants immediately).
    if (!course.isFree && course.price > 0) {
      const checkout = await getPaymentProvider().createCheckout({
        course,
        userId: user.id,
        locale: localeHint,
      });

      await prisma.order.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: course.price,
          currency: course.currency,
          status: checkout.grantImmediately ? "PAID" : "PENDING",
          provider: checkout.provider,
          providerRef: checkout.providerRef,
        },
      });

      if (!checkout.grantImmediately) {
        return ok({ requiresPayment: true, redirectUrl: checkout.redirectUrl });
      }
    } else {
      // Record a FREE order for a complete order history.
      await prisma.order.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: 0,
          currency: course.currency,
          status: "FREE",
          provider: "free",
        },
      });
    }

    await prisma.enrollment.create({
      data: { userId: user.id, courseId: course.id },
    });

    return created({ enrolled: true });
  } catch (err) {
    return handleError(err);
  }
}
