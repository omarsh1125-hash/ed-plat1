import { CreditCard } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate, formatPrice, localized } from "@/lib/utils";

export const dynamic = "force-dynamic";

const tone = { PAID: "green", PENDING: "amber", FAILED: "red", REFUNDED: "gray", FREE: "brand" } as const;

export default async function AdminPaymentsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const [orders, paidAgg, paidCount] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { titleEn: true, titleAr: true } },
      },
    }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.order.count({ where: { status: "PAID" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{dict.admin.paymentManagement}</h1>
        <Badge tone="amber">{(process.env.PAYMENTS_DRIVER || "stub").toUpperCase()}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={CreditCard} label={dict.admin.paymentManagement} value={formatPrice(paidAgg._sum.amount || 0, "USD", locale)} />
        <StatCard icon={CreditCard} label={dict.admin.published} value={paidCount} tone="green" />
        <StatCard icon={CreditCard} label={dict.admin.totalEnrollments} value={orders.length} tone="purple" />
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-10 w-10" />} title={dict.admin.paymentManagement} description={dict.common.comingSoon} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="p-3 text-start font-medium">{dict.auth.name}</th>
                <th className="p-3 text-start font-medium">{dict.nav.courses}</th>
                <th className="p-3 text-start font-medium">{dict.courses.price}</th>
                <th className="p-3 text-start font-medium">{dict.common.status}</th>
                <th className="p-3 text-start font-medium">{dict.admin.joined}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ink-50">
                  <td className="p-3"><p className="font-medium">{o.user.name}</p><p className="text-xs text-ink-400">{o.user.email}</p></td>
                  <td className="p-3">{localized(o.course, "title", locale)}</td>
                  <td className="p-3">{o.amount ? formatPrice(o.amount, o.currency, locale) : dict.common.free}</td>
                  <td className="p-3"><Badge tone={tone[o.status]}>{o.status}</Badge></td>
                  <td className="p-3 text-ink-500">{formatDate(o.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
