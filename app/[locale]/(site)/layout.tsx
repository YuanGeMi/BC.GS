import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </>
  );
}
