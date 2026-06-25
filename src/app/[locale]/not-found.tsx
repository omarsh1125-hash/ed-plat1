import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-20 text-center">
      <div>
        <p className="text-6xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found · الصفحة غير موجودة</h1>
        <p className="mt-2 text-ink-500">
          The page you’re looking for doesn’t exist. · الصفحة التي تبحث عنها غير موجودة.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/en">Home</ButtonLink>
          <ButtonLink href="/ar" variant="outline">الرئيسية</ButtonLink>
        </div>
      </div>
    </div>
  );
}
