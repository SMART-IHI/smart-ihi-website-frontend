import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale, asPath } = router;

  const toggleLanguage = () => {
    router.push(asPath, asPath, { locale: locale === "en" ? "zh" : "en" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-header/90 backdrop-blur supports-[backdrop-filter]:bg-header/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-foreground">
        <div className="text-lg font-bold">Institute of Human Immunology</div>
        <nav className="flex items-center gap-2">
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/">{t("home")}</Link>
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/research">{t("research")}</Link>
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/news">{t("news")}</Link>
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/education">{t("education")}</Link>
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/resources">{t("resources")}</Link>
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/jobs">{t("jobs")}</Link>
          <Link className="rounded-md px-3 py-1 text-foreground/80 hover:bg-mutedBg hover:text-foreground" href="/about">{t("about")}</Link>
          <button onClick={toggleLanguage} className="ml-2 rounded-md border border-border px-3 py-1 text-sm hover:bg-card">
            {locale === "en" ? "中文" : "EN"}
          </button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
