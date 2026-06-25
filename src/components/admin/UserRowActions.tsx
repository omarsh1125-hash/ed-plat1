"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, UserCheck, UserX } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";

export function UserRowActions({
  dict,
  userId,
  role,
  active,
  isSelf,
}: {
  dict: Dictionary;
  userId: string;
  role: "STUDENT" | "ADMIN";
  active: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  if (isSelf) return <span className="text-xs text-ink-400">—</span>;

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => patch({ role: role === "ADMIN" ? "STUDENT" : "ADMIN" })}
        disabled={busy}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-brand-700"
        title={role === "ADMIN" ? dict.admin.makeStudent : dict.admin.makeAdmin}
      >
        {role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
      </button>
      <button
        onClick={() => patch({ active: !active })}
        disabled={busy}
        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-brand-700"
        title={active ? dict.admin.deactivate : dict.admin.activate}
      >
        {active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
      </button>
    </div>
  );
}
