import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamMemberCard from "../../components/TeamMemberCard";
import ResearchCard from "../../components/ResearchCard";
import { fetchStrapi } from "../../lib/api";
import { renderMaybeMarkdown } from "../../lib/text";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export default function TeamDetail({ team, members, fields, publications = [], seeMore = null }) {
  const { t } = useTranslation("common");
  if (!team) return null;
  const a = team.attributes || team; // v4 vs v5
  const photos = a?.photo?.data || a?.photo || [];
  const first = Array.isArray(photos) ? (photos[0]?.attributes?.url || photos[0]?.url) : photos?.url;
  const cover = first ? (first.startsWith("http") ? first : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${first}`) : undefined;

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
      <section className="mx-auto max-w-6xl p-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
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
                className="prose prose-tight prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMaybeMarkdown(a.description) }}
              />
            )}

            {Array.isArray(fields) && fields.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-6 font-serif text-3xl text-primary">{t("related_fields", "Related Research Fields")}</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {fields.map((f) => {
                    const fa = f.attributes || f;
                    const slug = fa?.slug;
                    // Resolve image across Strapi shapes
                    const rel = fa?.image?.data?.[0]?.attributes?.url
                      || (Array.isArray(fa?.image) ? fa.image[0]?.url : fa?.image?.url)
                      || "";
                    const imageUrl = rel
                      ? (rel.startsWith("http") ? rel : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rel}`)
                      : undefined;
                    return (
                      <ResearchCard
                        key={f.id}
                        title={fa?.title || "Untitled"}
                        slug={slug}
                        imageUrl={imageUrl}
                      />
                    );
                  })}
                </div>
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
          </div>

          {/* Right/Sidebar column */}
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
                    const trimDoi = (pa.doi || "").toString().trim();
                    const doiHref = trimDoi
                      ? (/^https?:\/\//i.test(trimDoi) ? trimDoi : `https://doi.org/${trimDoi.replace(/^doi:\s*/i, "").trim()}`)
                      : undefined;
                    const rawUrl = pa.url || pa.link || pa.doi_url || (pa.pdf?.url) || (pa.file?.url) || "";
                    const absUrl = rawUrl
                      ? (/^(https?:)?\/\//i.test(rawUrl) ? rawUrl : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rawUrl}`)
                      : undefined;
                    const href = doiHref || absUrl;
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
                        {pa.authors && (
                          <div className="mt-1 text-muted">
                            {String(pa.authors)}
                          </div>
                        )}
                        {(pa.journal || year || pa.volume || pa.pages) && (
                          <div className="mt-1 text-muted">
                            {/* Journal highlighted; year and volume:pages remain muted */}
                            {pa.journal && (
                              <span className="italic font-medium text-foreground">{String(pa.journal)}</span>
                            )}
                            {year && (
                              <>
                                {pa.journal ? <span> · </span> : null}
                                <span>{year}</span>
                              </>
                            )}
                            {([pa.volume, pa.pages].filter(Boolean).length > 0) && (
                              <>
                                {(pa.journal || year) ? <span> · </span> : null}
                                <span>{[pa.volume, pa.pages].filter(Boolean).join(":")}</span>
                              </>
                            )}
                          </div>
                        )}
                        {trimDoi && (
                          <div className="mt-1">
                            <a
                              href={doiHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              DOI: {trimDoi}
                            </a>
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
            {seeMore && (
              <div className="mt-4">
                <a href={seeMore} target={/^https?:\/\//i.test(seeMore) ? "_blank" : undefined} rel={/^https?:\/\//i.test(seeMore) ? "noopener noreferrer" : undefined} className="inline-block text-primary hover:underline">
                  {t("see_all_publications", "See all publications")}
                </a>
              </div>
            )}
          </aside>
        </div>
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

  // Publications: prefer team-level JSON first
  let publications = [];
  let seeMore = null;
  try {
    const ta = team.attributes || team || {};
    const pubJson = ta.publictions || ta.publications; // handle both spellings
    const papers = Array.isArray(pubJson?.papers) ? pubJson.papers : [];
    const rawSee = pubJson?.see_more || pubJson?.seeMore;
    if (typeof rawSee === "string" && rawSee.trim()) {
      const s = rawSee.trim();
      if (/^https?:\/\//i.test(s)) {
        seeMore = s;
      } else if (s.startsWith("/uploads")) {
        seeMore = `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${s}`;
      } else {
        // Treat as internal route like /team/slug/publications
        seeMore = s;
      }
    }
    if (papers.length > 0) {
      publications = papers.map((p, i) => {
        const doi = (p?.doi || "").toString().trim();
        const url = p?.link || p?.url || (doi ? `https://doi.org/${doi.replace(/^doi:\s*/i, "").trim()}` : "");
        return {
          id: `local-${i}-${p?.link || p?.name || ""}`,
          title: p?.name || p?.title || "Untitled",
          url,
          doi: doi || null,
          authors: p?.authors,
          journal: p?.journal,
          year: p?.year,
          volume: p?.volume || null,
          pages: p?.pages || null,
        };
      });
    }
  } catch {}

  // Fallback: derive from related collections if none
  if (!Array.isArray(publications) || publications.length === 0) {
    try {
      const fieldSlugs = fields.map((f) => (f.attributes || f)?.slug).filter(Boolean);
      if (fieldSlugs.length > 0) {
        // Try a dedicated publications collection
        const pubResults = await Promise.all(
          fieldSlugs.map((s) => fetchStrapi(`publications?filters[research_fields][slug][$eq]=${encodeURIComponent(s)}`, "all"))
        );
        const flattened = pubResults
          .map((r) => (Array.isArray(r) ? r : (r ? [r] : [])))
          .flat();
        publications = flattened;

        // Fallback to resources if no publications collection or no results
        if (!Array.isArray(publications) || publications.length === 0) {
          const resResults = await Promise.all(
            fieldSlugs.map((s) => fetchStrapi(`resources?filters[research_fields][slug][$eq]=${encodeURIComponent(s)}`, "all"))
          );
          const resFlat = resResults
            .map((r) => (Array.isArray(r) ? r : (r ? [r] : [])))
            .flat();
          // If a type/category exists, prefer entries marked as publication
          publications = resFlat.filter((x) => {
            const xa = x.attributes || x || {};
            const type = (xa.type || xa.category || "").toString().toLowerCase();
            return type.includes("publication") || type.includes("paper") || type.includes("article");
          }).slice(0, 10);
          if (publications.length === 0) {
            publications = resFlat.slice(0, 10);
          }
        }
      }
    } catch (e) {
      publications = [];
    }
  }

  return {
    props: {
      team,
      fields,
      members,
      publications: (Array.isArray(publications) ? publications : []).map((p, idx) => {
        const pa = (p && p.attributes) ? p.attributes : (p || {});
        const id = p?.id || pa?.id || `pub-${idx}`;
        const title = pa?.title || pa?.name || "Untitled";
        const rawDoi = (pa?.doi || "").toString().trim();
        const doi = rawDoi ? rawDoi : null;
        const url = pa?.url || pa?.link || pa?.doi_url || (pa?.pdf?.url) || (pa?.file?.url) || (doi ? `https://doi.org/${rawDoi.replace(/^doi:\s*/i, "").trim()}` : null) || null;
        const authors = pa?.authors ?? null;
        const journal = pa?.journal ?? null;
        const volume = pa?.volume ?? null;
        const pages = pa?.pages ?? null;
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
        return {
          id: String(id),
          title: String(title),
          url: url ? String(url) : null,
          doi,
          authors,
          journal,
          volume,
          pages,
          year,
        };
      }),
      seeMore: seeMore || null,
      ...(await serverSideTranslations(locale, ["common"]))
    },
    revalidate: 10,
  };
}
