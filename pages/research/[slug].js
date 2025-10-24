import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamCard from "../../components/TeamCard";
import { fetchStrapi } from "../../lib/api";
import { renderMaybeMarkdown } from "../../lib/text";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import { useTranslation } from "next-i18next";

export default function ResearchDetail({ field, teams, publications = [] }) {
  const { t } = useTranslation("common");
  const a = field?.attributes || field || {};
  const title = a?.title || "";
  const description = a?.description || "";
  // Resolve hero image for this research field (supports Strapi v4/v5 shapes)
  const rel = a.image?.data?.[0]?.attributes?.url
    || (Array.isArray(a.image) ? a.image[0]?.url : a.image?.url)
    || "";
  const imageUrl = rel
    ? (rel.startsWith("http") ? rel : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rel}`)
    : undefined;
  // Publications pagination state (client-side)
  const pageSize = 8;
  const [pubPage, setPubPage] = useState(1);
  const totalPages = Math.ceil((Array.isArray(publications) ? publications.length : 0) / pageSize) || 1;
  const start = (pubPage - 1) * pageSize;
  const end = start + pageSize;
  const pubsSlice = (Array.isArray(publications) ? publications : []).slice(start, end);
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left/Main */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-serif mb-4">{title}</h2>
            {imageUrl && (
              <figure className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <img src={imageUrl} alt={title} className="h-64 w-full object-cover" />
              </figure>
            )}
            {description && (
              <div
                className="prose prose-neutral dark:prose-invert max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: renderMaybeMarkdown(description) }}
              />
            )}
            <h3 className="text-2xl mb-4">{t("teams_in_field", "Teams in this field")}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(teams || []).map((team) => {
                const ta = team?.attributes || team || {};
                const href = ta.slug ? `/team/${ta.slug}` : undefined;
                return <TeamCard key={team.id} team={team} href={href} showDescription={false} showPI={false} />;
              })}
            </div>
          </div>

          {/* Right/Sidebar */}
          <aside>
            <h2 className="mb-4 font-serif text-2xl text-primary">{t("key_publications", "Key Publications")}</h2>
            {Array.isArray(publications) && publications.length > 0 ? (
              <>
                <ul className="space-y-4 text-sm">
                  {pubsSlice.map((p, idx) => {
                    const pa = p.attributes || p || {};
                    const title = pa.title || pa.name || "Untitled";
                    const year = (() => {
                      const src = pa.year || pa.publishedAt || pa.date || pa.createdAt;
                      if (!src) return "";
                      const d = new Date(src);
                      return isNaN(d) ? "" : String(d.getFullYear());
                    })();
                    const rawUrl = pa.url || pa.link || pa.doi_url || pa.doi || (pa.pdf?.url) || (pa.file?.url) || "";
                    const href = rawUrl
                      ? (/^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rawUrl}`)
                      : undefined;
                    const key = `pub-${p?.id || pa?.id || pa?.url || pa?.link || idx}`;
                    return (
                      <li key={key} className="rounded-md border border-border bg-card p-3">
                        <div className="font-medium">
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {title}
                            </a>
                          ) : (
                            title
                          )}
                        </div>
                        {(pa.authors || pa.journal || year) && (
                          <div className="mt-1 text-muted">
                            {[pa.authors, pa.journal, year].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <button
                      className="rounded border border-border px-3 py-1 text-foreground hover:bg-muted"
                      onClick={() => setPubPage((p) => Math.max(1, p - 1))}
                      disabled={pubPage === 1}
                    >
                      {t("prev", "Previous")}
                    </button>
                    <span className="text-muted">
                      {t("page_of", "Page {{page}} of {{total}}", { page: pubPage, total: totalPages })}
                    </span>
                    <button
                      className="rounded border border-border px-3 py-1 text-foreground hover:bg-muted"
                      onClick={() => setPubPage((p) => Math.min(totalPages, p + 1))}
                      disabled={pubPage === totalPages}
                    >
                      {t("next", "Next")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted">{t("no_publications", "No publications available.")}</p>
            )}
          </aside>
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
  // Derive publications: prefer teams' JSON (publictions/publications.papers). If empty, fallback to collections by field slug.
  let publications = [];
  try {
    const teamPubs = (Array.isArray(teams) ? teams : []).flatMap((t) => {
      const ta = t?.attributes || t || {};
      const pub = ta.publictions || ta.publications;
      const papers = Array.isArray(pub?.papers) ? pub.papers : [];
      return papers.map((p, i) => ({
        id: `team-${ta.slug || ta.id || i}-${p?.link || p?.name || i}`,
        title: p?.name || p?.title || "Untitled",
        url: p?.link || p?.url || null,
        authors: p?.authors ?? null,
        journal: p?.journal ?? null,
        year: p?.year ?? null,
      }));
    });
    publications = teamPubs;
  } catch {}

  if (!Array.isArray(publications) || publications.length === 0) {
    try {
      const pubs = await fetchStrapi(`publications?filters[research_fields][slug][$eq]=${encodeURIComponent(params.slug)}`, "all");
      const arr = Array.isArray(pubs) ? pubs : (pubs ? [pubs] : []);
      publications = arr;
      if (!Array.isArray(publications) || publications.length === 0) {
        const res = await fetchStrapi(`resources?filters[research_fields][slug][$eq]=${encodeURIComponent(params.slug)}`, "all");
        const ra = Array.isArray(res) ? res : (res ? [res] : []);
        publications = ra.filter((x) => {
          const xa = x?.attributes || x || {};
          const type = (xa.type || xa.category || "").toString().toLowerCase();
          return type.includes("publication") || type.includes("paper") || type.includes("article");
        }).slice(0, 20);
        if (publications.length === 0) publications = ra.slice(0, 20);
      }
    } catch {
      publications = [];
    }
  }

  // Sanitize publications for Next.js serialization
  const safePublications = (Array.isArray(publications) ? publications : []).map((p, idx) => {
    const pa = (p && p.attributes) ? p.attributes : (p || {});
    const id = p?.id || pa?.id || `pub-${idx}`;
    const title = pa?.title || pa?.name || "Untitled";
    const url = pa?.url || pa?.link || pa?.doi_url || pa?.doi || (pa?.pdf?.url) || (pa?.file?.url) || null;
    const authors = pa?.authors ?? null;
    const journal = pa?.journal ?? null;
    let year = null;
    const yr = pa?.year || pa?.publishedAt || pa?.date || pa?.createdAt;
    if (yr) {
      try {
        const d = new Date(yr);
        year = isNaN(d) ? String(yr) : String(d.getFullYear());
      } catch {
        year = String(yr);
      }
    }
    return { id: String(id), title: String(title), url: url ? String(url) : null, authors, journal, year };
  });
  return {
    props: {
      field,
      teams: Array.isArray(teams) ? teams : [],
      publications: safePublications,
      ...(await serverSideTranslations(locale, ["common"]))
    },
    revalidate: 10,
  };
}
