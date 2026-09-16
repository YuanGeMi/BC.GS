import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NotFoundCopy } from "@/components/not-found-copy";
import { getLocale } from "next-intl/server";

export default async function NotFound() {
  const locale = await getLocale();

  return (
    <>
      <Header locale={locale} />
      <main className="min-w-0 flex-1">
        <NotFoundCopy />
      </main>
      <Footer />
    </>
  );
}
