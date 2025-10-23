import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamCard from "../../components/TeamCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function ResearchDetail({ field, teams }) {
  const a = field?.attributes || field || {};
  const title = a?.title || "";
  const description = a?.description || "";
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
        <h2 className="text-3xl font-serif mb-4">{title}</h2>
        {description && (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <h3 className="text-2xl mb-4">Teams in this field</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {(teams || []).map((team) => {
            const ta = team?.attributes || team || {};
            const href = ta.slug ? `/team/${ta.slug}` : undefined;
            return <TeamCard key={team.id} team={team} href={href} showDescription={false} />;
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const fields = await fetchStrapi("research-fields", "en");
  const paths = (fields || [])
    .map((f) => {
      const a = f.attributes || f;
      const slug = a?.slug;
      return slug ? { params: { slug } } : null;
    })
    .filter(Boolean);
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params, locale }) {
  const fields = await fetchStrapi(`research-fields?filters[slug][$eq]=${params.slug}`, "all");
  const field = Array.isArray(fields) ? fields[0] : null;
  if (!field) {
    return { notFound: true, revalidate: 10 };
  }
  const teams = await fetchStrapi(
    `research-teams?filters[research_fields][slug][$eq]=${params.slug}`,
    "all"
  );
  return {
    props: {
      field,
      teams: Array.isArray(teams) ? teams : [],
      ...(await serverSideTranslations(locale, ["common"]))
    },
    revalidate: 10,
  };
}
