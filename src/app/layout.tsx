import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_PLATFORM_NAME || "EduPlatform",
    template: `%s · ${process.env.NEXT_PUBLIC_PLATFORM_NAME || "EduPlatform"}`,
  },
  description: "A modern bilingual (Arabic/English) learning platform.",
};

// Root layout is a passthrough: the real <html>/<body> live in the [locale]
// layout so `lang` and `dir` can be set per request locale (LTR/RTL).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
