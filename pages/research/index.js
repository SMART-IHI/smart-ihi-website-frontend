import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ResearchCard from "../../components/ResearchCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { normalizeAssetUrl } from "../../lib/text";

export default function Research({ fields = [], locale }) {
  return (
    <div>
      <Header />
      <section className="mx-auto max-w-6xl p-10">
        <h2 className="mb-6 font-serif text-3xl text-primary">Research Fields</h2>
        {(!Array.isArray(fields) || fields.length === 0) ? (
          <p className="text-muted">No research fields found for locale: <strong>{locale}</strong>. Try switching language or publish localized content in Strapi.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(fields || [])
              .filter((f) => f && (f.attributes || f.title || f.slug))
              .map((field) => {
                const a = field.attributes || field; // Support Strapi v4 (attributes) and v5 (flat)
                const rel = a.image?.data?.[0]?.attributes?.url
                  || (Array.isArray(a.image) ? a.image[0]?.url : a.image?.url)
                  || "";
                const path = normalizeAssetUrl(rel);
                const imageUrl = path
                  ? (path.startsWith("http") ? path : path)
                  : undefined;
                return (
                  <ResearchCard
                    key={field.id}
                    title={a.title || "Untitled"}
                    description={a.description || ""}
                    slug={a.slug}
                    imageUrl={imageUrl}
                    descriptionLines={4}
                    excerptLength={300}
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

export async function getStaticProps({ locale }) {
  try {
    // Ignore locale: fetch all localizations so content always appears after publish
    const fields = await fetchStrapi("research-fields", "all");
    return {
      props: {
        fields,
        locale,
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10,
    };
  } catch (e) {
    return {
      props: {
        fields: [],
        locale,
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10,
    };
  }
}
