import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamMemberCard from "../../components/TeamMemberCard";
import { fetchStrapi } from "../../lib/api";
import { renderMaybeMarkdown } from "../../lib/text";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function TeamDetail({ team, members, fields }) {
  const { t } = useTranslation("common");
  if (!team) return null;
  const a = team.attributes || team; // v4 vs v5
  const photos = a?.photo?.data || a?.photo || [];
  const first = Array.isArray(photos) ? (photos[0]?.attributes?.url || photos[0]?.url) : photos?.url;
  const cover = first ? (first.startsWith("http") ? first : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${first}`) : undefined;

  return (
    <div>
      <Header />
      <section className="mx-auto max-w-4xl p-10">
        <div className="mb-6 flex items-center gap-4">
          {cover && <img src={cover} alt={a.name} className="h-24 w-24 rounded-lg object-cover" />}
          <div>
            <h1 className="font-serif text-3xl">{a.name}</h1>
            {a.pi_name && (
              <p className="text-muted">{t("pi_label", "Principal Investigator")}：{a.pi_name}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
              {a.pi_email && (
                <span>
                  {t("pi_email", "PI Email")}：
                  <a href={`mailto:${a.pi_email}`} className="text-primary hover:underline">{a.pi_email}</a>
                </span>
              )}
              {a.website && (
                <span>
                  {t("website", "Website")}：
                  {(() => {
                    const raw = String(a.website).trim();
                    const url = /^(https?:)?\/\//i.test(raw) ? raw : `https://${raw}`;
                    return (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {raw}
                      </a>
                    );
                  })()}
                </span>
              )}
              {a.joined_date && (
                <span>
                  {t("joined_date", "Joined Date")}：
                  {(() => {
                    try {
                      const d = new Date(a.joined_date);
                      if (!isNaN(d)) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        return `${y}-${m}-${day}`;
                      }
                      return a.joined_date;
                    } catch {
                      return a.joined_date;
                    }
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>
        {a.description && (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMaybeMarkdown(a.description) }}
          />
        )}

        {Array.isArray(fields) && fields.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-2xl">{t("related_fields", "Related Research Fields")}</h2>
            <ul className="space-y-2">
              {fields.map((f) => {
                const fa = f.attributes || f;
                const slug = fa.slug;
                return (
                  <li key={f.id}>
                    {slug ? (
                      <a href={`/research/${slug}`} className="text-primary hover:underline">
                        {fa.title}
                      </a>
                    ) : (
                      <span>{fa.title}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {Array.isArray(members) && members.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-2xl">{t("team_members", "Team Members")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {members.map((m) => {
                const ma = m.attributes || m;
                const mPhotos = ma.photo?.data || ma.photo || [];
                const mFirst = Array.isArray(mPhotos) ? (mPhotos[0]?.attributes?.url || mPhotos[0]?.url) : mPhotos?.url;
                const mPhoto = mFirst ? (mFirst.startsWith("http") ? mFirst : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${mFirst}`) : undefined;
                return (
                  <TeamMemberCard key={m.id} name={ma.name} title={ma.title} photo={mPhoto} />
                );
              })}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const teams = await fetchStrapi("research-teams", "all");
  const paths = (teams || [])
    .map((t) => {
      const a = t.attributes || t;
      const slug = a?.slug;
      return slug ? { params: { slug } } : null;
    })
    .filter(Boolean);
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params, locale }) {
  const slug = params.slug;
  const bySlug = await fetchStrapi(`research-teams?filters[slug][$eq]=${slug}`, "all");
  const team = Array.isArray(bySlug) ? bySlug[0] : null;
  if (!team) return { notFound: true, revalidate: 10 };

  const tf = (team.attributes?.research_fields?.data) || team.research_fields || [];
  const fields = Array.isArray(tf) ? tf : [];

  const tm = (team.attributes?.members?.data) || team.members || [];
  const members = Array.isArray(tm) ? tm : [];

  return {
    props: {
      team,
      fields,
      members,
      ...(await serverSideTranslations(locale, ["common"]))
    },
    revalidate: 10,
  };
}
