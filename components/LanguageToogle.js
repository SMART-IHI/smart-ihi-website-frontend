import { useRouter } from "next/router";

export default function LanguageToggle() {
  const router = useRouter();
  const { locale, asPath } = router;

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "zh" : "en";
    router.push(asPath, asPath, { locale: newLocale });
  };

  return (
    <button onClick={toggleLanguage} className="ml-4 font-semibold">
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}
