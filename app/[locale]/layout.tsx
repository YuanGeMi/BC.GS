import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Inter, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";

import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { PasswordRecoveryListener } from "@/components/auth/password-recovery-listener";
import { routing } from "@/i18n/routing";
import { siteMetadataBase } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, site] = await Promise.all([
    getTranslations("Meta"),
    getSiteConfig(),
  ]);

  const titleDefault = site.seoTitleDefault || t("title");
  const description = site.seoDescriptionDefault || t("description");

  return {
    metadataBase: siteMetadataBase,
    title: {
      default: titleDefault,
      template: `%s · ${site.siteName}`,
    },
    description,
    applicationName: site.siteName,
    icons: {
      icon: [{ url: site.faviconUrl }],
      apple: [{ url: site.faviconUrl }],
    },
    openGraph: {
      siteName: site.siteName,
      type: "website",
      images: [
        {
          url: site.ogImageUrl,
          width: 1200,
          height: 630,
          alt: site.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [site.ogImageUrl],
    },
    appleWebApp: {
      title: site.siteName,
    },
    other: {
      google: "notranslate",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0D0F12",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${newsreader.variable} h-full`}
    >
      <body className="bg-background text-text flex min-h-full min-w-0 flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider>
            <PasswordRecoveryListener />
            <div className="flex min-h-full min-w-0 flex-1 flex-col">{children}</div>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
