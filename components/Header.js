import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale, asPath } = router;

  const toggleLanguage = () => {
    router.push(asPath, asPath, { locale: locale === "en" ? "zh" : "en" });
  };

  const isActive = (href) => {
    // Basic active matcher: exact or prefix for sections
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.asPath.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-header/90 backdrop-blur supports-[backdrop-filter]:bg-header/70">
      <div
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-2 items-center gap-x-2 gap-y-2 px-4 py-3 text-foreground md:grid-rows-1 md:gap-x-4 md:px-24"
      >
        {/* Left: Logos */}
  <Link href="/" aria-label="Home" className="flex shrink-0 items-center gap-2 md:col-start-1 md:row-start-1">
          <Image
            src="/images/smart.png"
            alt="SMART logo"
            width={96}
            height={96}
            className="h-10 w-auto md:h-10 mr-5"
            sizes="(min-width: 768px) 80px, 64px"
            quality={95}
            priority
          />
          <Image
            src="/images/logo.jpg"
            alt="Institute logo"
            width={480}
            height={120}
            className="h-10 w-auto md:h-12"
            sizes="(min-width: 768px) 192px, 160px"
            quality={95}
            priority
          />
        </Link>
        {/* Center: Nav (mobile: second row, spans full width; desktop: centered) */}
  <nav className="col-start-2 row-start-2 flex max-w-full min-w-0 flex-wrap items-center justify-center gap-1 md:row-start-1">
          {[
            { href: "/", label: t("home") },
            { href: "/research", label: t("research") },
            { href: "/news", label: t("news") },
            { href: "/education", label: t("education") },
            { href: "/resources", label: t("resources") },
            { href: "/jobs", label: t("jobs") },
            { href: "/about", label: t("about") },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-2 py-1 text-sm md:px-3 md:text-base ${
                isActive(href)
                  ? "bg-mutedBg text-foreground"
                  : "text-foreground/70 hover:bg-mutedBg hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {/* Right: Actions (mobile: same row as nav, right-aligned; desktop: top-right) */}
  <div className="col-start-3 row-start-1 flex items-center justify-end gap-2 justify-self-end md:row-start-1">
          <button onClick={toggleLanguage} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-card">
            {locale === "en" ? "中文" : "EN"}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
