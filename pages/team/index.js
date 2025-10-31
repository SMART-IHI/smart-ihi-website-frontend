import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamCard from "../../components/TeamCard";
import { fetchStrapi } from "../../lib/api";
import { normalizeAssetUrl } from "../../lib/text";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function TeamIndex({ teams = [] }) {
  const { t } = useTranslation("common");
  return (
    <div>
      <Header />
      <section className="mx-auto max-w-6xl p-10">
        <h2 className="mb-6 font-serif text-3xl text-primary">{t("team")}</h2>
        {(!Array.isArray(teams) || teams.length === 0) ? (
          <p className="text-muted">{t("no_teams", "No teams found.")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {(teams || [])
              .filter((team) => team && (team.attributes || team.name))
              .map((team) => {
                const a = team.attributes || team; // v4 vs v5
                const rel = a.photo?.data?.[0]?.attributes?.url
                  || (Array.isArray(a.photo) ? a.photo[0]?.url : a.photo?.url)
                  || "";
                const path = normalizeAssetUrl(rel);
                const imageUrl = path
                  ? (path.startsWith("http") ? path : path)
                  : undefined;
                const href = a.slug ? `/team/${a.slug}` : undefined;
                const rf = a.research_fields?.data || a.research_fields || [];
                const rfTitles = Array.isArray(rf)
                  ? rf.map((r) => (r?.attributes ? r.attributes.title : r?.title)).filter(Boolean)
                  : [];
                return (
                  <TeamCard
                    key={team.id}
                    name={a.name}
                    piName={a.pi_name}
                    description={a.description}
                    imageUrl={imageUrl}
                    href={href}
                    team={team}
                    showDescription={false}
                    fields={rfTitles}
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
    // Fetch across locales so newly published teams are visible
    const teams = await fetchStrapi("research-teams", "all");
    return {
      props: {
        teams,
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10,
    };
  } catch (e) {
    return {
      props: {
        teams: [],
        ...(await serverSideTranslations(locale, ["common"]))
      },
      revalidate: 10,
    };
  }
}
