import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import { siteMetadataBase } from "@/lib/seo";

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
  const t = await getTranslations("Meta");

  return {
    metadataBase: siteMetadataBase,
    title: {
      default: t("title"),
      template: t("template"),
    },
    description: t("description"),
    applicationName: "BC.GS",
    openGraph: {
      siteName: "BC.GS",
      type: "website",
      images: [
        {
          url: "/brand/og.png",
          width: 1200,
          height: 630,
          alt: "BC.GS",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/brand/og.png"],
    },
    appleWebApp: {
      title: "BC.GS",
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
          <Header />
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
