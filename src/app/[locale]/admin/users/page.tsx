import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { Badge } from "@/components/ui";
import { UserRowActions } from "@/components/admin/UserRowActions";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const session = await getCurrentSession();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, active: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dict.admin.userManagement}</h1>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs uppercase text-ink-400">
            <tr>
              <th className="p-3 text-start font-medium">{dict.auth.name}</th>
              <th className="p-3 text-start font-medium">{dict.admin.role}</th>
              <th className="p-3 text-start font-medium">{dict.common.status}</th>
              <th className="p-3 text-start font-medium">{dict.dashboard.enrolledCourses}</th>
              <th className="p-3 text-start font-medium">{dict.admin.joined}</th>
              <th className="p-3 text-end font-medium">{dict.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-ink-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                      {initials(u.name)}
                    </span>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-ink-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge tone={u.role === "ADMIN" ? "purple" : "gray"}>
                    {u.role === "ADMIN" ? dict.nav.admin : dict.nav.myLearning}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge tone={u.active ? "green" : "red"}>
                    {u.active ? dict.admin.activate : dict.admin.deactivate}
                  </Badge>
                </td>
                <td className="p-3">{u._count.enrollments}</td>
                <td className="p-3 text-ink-500">{formatDate(u.createdAt, locale)}</td>
                <td className="p-3">
                  <UserRowActions
                    dict={dict}
                    userId={u.id}
                    role={u.role}
                    active={u.active}
                    isSelf={u.id === session?.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
