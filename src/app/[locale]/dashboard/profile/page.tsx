import { getCurrentUser } from "@/lib/session";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{dict.profile.title}</h1>
      <ProfileForm
        locale={locale}
        dict={dict}
        initial={{
          name: user?.name || "",
          email: user?.email || "",
          bio: user?.bio || "",
          avatarUrl: user?.avatarUrl || "",
        }}
      />
    </div>
  );
}
