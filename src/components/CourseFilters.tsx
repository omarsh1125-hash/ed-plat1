"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import { localized } from "@/lib/utils";

type Cat = { id: string; slug: string; nameEn: string; nameAr: string };

export function CourseFilters({
  locale,
  dict,
  categories,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Cat[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-2">
        <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-400 ltr:left-3 rtl:right-3 h-4 w-4" />
        <Input
          defaultValue={params.get("search") || ""}
          placeholder={dict.courses.searchPlaceholder}
          className="ltr:pl-9 rtl:pr-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
          }}
        />
      </div>

      <Select
        defaultValue={params.get("category") || ""}
        onChange={(e) => update("category", e.target.value)}
        aria-label={dict.courses.category}
      >
        <option value="">{dict.courses.allCategories}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {localized(c, "name", locale)}
          </option>
        ))}
      </Select>

      <Select
        defaultValue={params.get("level") || ""}
        onChange={(e) => update("level", e.target.value)}
        aria-label={dict.courses.level}
      >
        <option value="">{dict.courses.allLevels}</option>
        <option value="BEGINNER">{dict.courses.level_BEGINNER}</option>
        <option value="INTERMEDIATE">{dict.courses.level_INTERMEDIATE}</option>
        <option value="ADVANCED">{dict.courses.level_ADVANCED}</option>
      </Select>
    </div>
  );
}
