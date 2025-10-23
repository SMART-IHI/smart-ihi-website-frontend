import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import ResearchCard from "../components/ResearchCard";
import { fetchStrapi } from "../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home({ researchFields = [], locale }) {
  return (
    <div>
      <Header />
      <Banner />
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
    return {
      props: {
        researchFields,
        locale,
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
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10,
    };
  }
}
