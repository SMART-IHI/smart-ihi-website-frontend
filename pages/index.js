import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import ResearchCard from "../components/ResearchCard";
import { fetchStrapi } from "../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home({ researchFields = [], locale, home }) {
  const ha = home?.attributes || home || {};
  const headline = ha.headline || "";
  const mission = ha.mission || "";
  // Build banner items from home.banner_images if provided
  const bi = ha.banner_images;
  const rel = bi?.data?.attributes?.url || (Array.isArray(bi) ? bi[0]?.url : bi?.url) || "";
  const bannerUrl = rel ? (rel.startsWith("http") ? rel : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rel}`) : undefined;
  const bannerItems = bannerUrl ? [{ url: bannerUrl, alt: headline || "Hero", caption: headline || mission }] : undefined;
  const missionBgUrl = bannerUrl || "/images/human_microbiome.webp";
  return (
    <div>
      <Header />
      <Banner items={bannerItems} />
      {(headline || mission) && (
        <section className="mx-auto max-w-6xl p-10 pt-10">
          {headline && (
            <h1 className="mb-4 font-serif text-3xl text-primary md:text-4xl">
              {headline}
            </h1>
          )}
          {mission && (
            <figure className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-accent" />
              <div className="relative p-6 md:p-8">
                <p className="whitespace-pre-line text-2xl md:text-3xl leading-snug font-serif italic text-foreground/90">
                  {mission}
                </p>
              </div>
            </figure>
          )}
        </section>
      )}
      <section className="mx-auto max-w-6xl p-10">
  <h2 className="mb-6 font-serif text-3xl text-primary">Our Research Fields</h2>
        {(!Array.isArray(researchFields) || researchFields.length === 0) ? (
          <p className="text-muted">No research fields found for locale: <strong>{locale}</strong>. Try switching language or publish localized content in Strapi.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {(researchFields || [])
              .filter((f) => f && (f.attributes || f.title || f.slug))
              .map((field) => {
                const a = field.attributes || field; // Support Strapi v4 (attributes) and v5 (flat)
                // Resolve image URL across shapes: v4 -> image.data[0].attributes.url, v5 -> image[0].url or image.url
                const rel = a.image?.data?.[0]?.attributes?.url
                  || (Array.isArray(a.image) ? a.image[0]?.url : a.image?.url)
                  || "";
                const imageUrl = rel
                  ? (rel.startsWith("http") ? rel : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rel}`)
                  : undefined;
                return (
                  <ResearchCard
                    key={field.id}
                    title={a.title || "Untitled"}
                    description={a.description || ""}
                    slug={a.slug}
                    imageUrl={imageUrl}
                  />
                );
              })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

// Fetch research fields from Strapi
export async function getStaticProps({ locale }) {
  try {
    // Ignore locale: fetch all localizations so content always appears after publish
    const researchFields = await fetchStrapi("research-fields", "all");
    // Home single type from Strapi; pick current locale variant if available
    const homes = await fetchStrapi("home", "all");
    const targetLocale = (process.env.NEXT_PUBLIC_STRAPI_LOCALE_MAP?.[locale]) || locale;
    const home = Array.isArray(homes)
      ? (homes.find((h) => (h.attributes?.locale || h.locale) === targetLocale) || homes[0])
      : homes;
    return {
      props: {
        researchFields,
        locale,
        home: home || null,
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10, // ISR
    };
  } catch (e) {
    // Graceful fallback to render page even if Strapi is unavailable or permissions are missing
    return {
      props: {
        researchFields: [],
        locale,
        home: null,
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10,
    };
  }
}
