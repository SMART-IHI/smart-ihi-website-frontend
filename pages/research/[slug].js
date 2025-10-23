import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamMemberCard from "../../components/TeamMemberCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function ResearchDetail({ field, teams }) {
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
        <h2 className="text-3xl font-serif mb-4">{field.attributes.title}</h2>
        {field.attributes.description && (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: field.attributes.description }}
          />
        )}
        <h3 className="text-2xl mb-4">Teams in this field</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {teams.map((team) => {
            const photoArray = team.attributes.photo?.data || [];
            const raw = photoArray[0]?.attributes?.url || "";
            const firstPhoto = raw.startsWith("http") ? raw : (raw ? `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${raw}` : undefined);
            const slug = team.attributes.slug;
            const href = `/team/${slug || team.id}`;
            return (
              <a key={team.id} href={href}>
                <TeamMemberCard
                  name={team.attributes.name}
                  title={team.attributes.pi_name}
                  photo={firstPhoto}
                />
              </a>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const fields = await fetchStrapi("research-fields", "en"); // use default EN for paths
  const paths = fields.map((f) => ({ params: { slug: f.attributes.slug } }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params, locale }) {
  const fields = await fetchStrapi(`research-fields?filters[slug][$eq]=${params.slug}`, locale);
  const field = fields[0];
  const teams = await fetchStrapi(
    `research-teams?filters[research_fields][slug][$eq]=${params.slug}`,
    locale
  );
  return {
    props: {
      field,
      teams,
      ...(await serverSideTranslations(locale, ["common"]))
    },
    revalidate: 10,
  };
}
