import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

const content: Record<Locale, { title: string; body: string[] }> = {
  en: {
    title: "Terms & Conditions",
    body: [
      "By using this platform you agree to these terms. Please read them carefully.",
      "Accounts: You are responsible for keeping your login credentials secure and for all activity under your account.",
      "Content: Course materials are provided for your personal learning. Redistribution without permission is not allowed.",
      "Payments: Paid courses grant access according to the order terms shown at checkout. Refund policy is described separately where applicable.",
      "Certificates: Certificates are issued upon completion and may be verified using their unique ID.",
      "These terms may be updated from time to time; continued use constitutes acceptance of changes.",
    ],
  },
  ar: {
    title: "الشروط والأحكام",
    body: [
      "باستخدامك هذه المنصة فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية.",
      "الحسابات: أنت مسؤول عن الحفاظ على سرية بيانات تسجيل دخولك وعن جميع الأنشطة التي تتم عبر حسابك.",
      "المحتوى: تُقدَّم مواد الدورات لأغراض التعلّم الشخصي. لا يُسمح بإعادة توزيعها دون إذن.",
      "المدفوعات: تمنح الدورات المدفوعة الوصول وفقاً لشروط الطلب المعروضة عند الدفع. تُوضّح سياسة الاسترداد بشكل منفصل عند الاقتضاء.",
      "الشهادات: تُصدر الشهادات عند الإكمال ويمكن التحقّق منها باستخدام رقمها الفريد.",
      "قد تُحدَّث هذه الشروط من وقت لآخر، ويُعدّ استمرار الاستخدام قبولاً للتغييرات.",
    ],
  },
};

export default function TermsPage({ params }: { params: { locale: Locale } }) {
  const c = content[params.locale];
  return (
    <div className="container-px max-w-3xl py-14">
      <h1 className="text-3xl font-bold">{c.title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink-600">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
