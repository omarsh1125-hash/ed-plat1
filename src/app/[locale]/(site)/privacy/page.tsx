import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

const content: Record<Locale, { title: string; body: string[] }> = {
  en: {
    title: "Privacy Policy",
    body: [
      "We respect your privacy. This policy explains what data we collect and how we use it.",
      "Data we collect: Your name, email, and learning activity (enrollments, progress, quiz results, certificates).",
      "How we use it: To provide the service, track your progress, issue certificates, and improve the platform.",
      "Security: Passwords are hashed and never stored in plain text. Access to learning content is protected by authentication.",
      "Your choices: You can update your profile and language preference at any time from your account settings.",
      "We do not sell your personal data to third parties.",
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    body: [
      "نحترم خصوصيتك. توضّح هذه السياسة البيانات التي نجمعها وكيفية استخدامها.",
      "البيانات التي نجمعها: اسمك وبريدك الإلكتروني ونشاطك التعليمي (التسجيلات، التقدّم، نتائج الاختبارات، الشهادات).",
      "كيفية استخدامها: لتقديم الخدمة وتتبّع تقدّمك وإصدار الشهادات وتحسين المنصة.",
      "الأمان: تُشفَّر كلمات المرور ولا تُخزَّن أبداً كنصّ صريح. الوصول إلى المحتوى التعليمي محميّ بالمصادقة.",
      "خياراتك: يمكنك تحديث ملفك الشخصي وتفضيل اللغة في أي وقت من إعدادات حسابك.",
      "نحن لا نبيع بياناتك الشخصية لأطراف ثالثة.",
    ],
  },
};

export default function PrivacyPage({ params }: { params: { locale: Locale } }) {
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
