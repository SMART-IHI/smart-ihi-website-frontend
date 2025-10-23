import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamMemberCard from "../../components/TeamMemberCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function TeamIndex({ teams }) {
  const { t } = useTranslation("common");
  return (
    <div>
      <Header />
      <section className="mx-auto max-w-6xl p-10">
        <h2 className="mb-6 font-serif text-3xl text-primary">{t("team")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {teams.map((team) => {
            const photoArray = team.attributes.photo?.data || [];
            const raw = photoArray[0]?.attributes?.url || "";
            const firstPhoto = raw.startsWith("http")
              ? raw
              : raw
              ? `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${raw}`
              : undefined;
            const slug = team.attributes.slug;
            const href = `/team/${slug || team.id}`;
            return (
              <a key={team.id} href={href}>
                <TeamMemberCard name={team.attributes.name} title={team.attributes.pi_name} photo={firstPhoto} />
              </a>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  const teams = await fetchStrapi("research-teams", locale);
  return {
    props: {
      teams,
      ...(await serverSideTranslations(locale, ["common"]))
    },
    revalidate: 10,
  };
}
