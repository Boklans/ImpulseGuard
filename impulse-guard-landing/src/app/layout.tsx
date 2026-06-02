import { LanguageProvider } from "@inlang/paraglide-next";
import type { Metadata } from "next";
import "./globals.css";
import "./fonts";
import { TooltipProvider } from "@/components/ui/tooltip";
import { languageTag } from "@/paraglide/runtime";
import { fontInterItalicVariable, fontInterVariable } from "@/app/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";
import dynamic from "next/dynamic";
import { PHProvider } from "@/components/PHProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "ImpulseGuard - Beat Cravings in 10 Minutes",
    template: "%s | ImpulseGuard",
  },
  description:
    "ImpulseGuard helps you pause before an impulse, get through cravings with 10-minute sessions, and turn habit change into gameplay.",
  keywords: [
    "craving tracker",
    "quit vaping",
    "stop snacking",
    "phone addiction",
    "impulse control",
    "habit tracker",
    "break bad habits",
    "self improvement",
    "habit building",
    "impulse management",
    "gamified habits",
  ],
  authors: [{ name: "ImpulseGuard Team" }],
  creator: "ImpulseGuard",
  metadataBase: new URL("https://impulseguard.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://impulseguard.app",
    siteName: "ImpulseGuard",
    title: "ImpulseGuard - Beat Cravings in 10 Minutes",
    description:
      "Pause before you act, get through cravings with 10-minute sessions, and track your progress.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImpulseGuard - Beat Cravings in 10 Minutes",
    description:
      "Pause before you act, get through cravings with 10-minute sessions, and track your progress.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const PostHogPageView = dynamic(() => import("../components/PostHogPageView"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <TooltipProvider>
        <PHProvider>
          <html lang={languageTag()}>
            <GoogleAnalytics gaId={"G-XFPY6R4PH2"} />
            <body
              className={`${fontInterVariable.variable} ${fontInterItalicVariable.variable} antialiased bg-background`}
            >
              <PostHogPageView />
              {children}
              <Toaster />
            </body>
          </html>
        </PHProvider>
      </TooltipProvider>
    </LanguageProvider>
  );
}
