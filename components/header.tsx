import { HeaderChrome } from "@/components/header-chrome";
import { Logo } from "@/components/logo";

type HeaderProps = {
  locale: string;
};

/** Static shell: server Logo + client chrome (nav / auth / mobile). No auth fetch. */
export function Header({ locale }: HeaderProps) {
  return (
    <header className="border-text/8 bg-background/85 sticky top-0 z-50 w-full min-w-0 border-b backdrop-blur-md">
      <HeaderChrome locale={locale}>
        <Logo size="md" priority />
      </HeaderChrome>
    </header>
  );
}
