import { excerpt } from "../lib/text";

// TeamCard: Displays a team summary with image, name, PI, short description, and optional field chips
export default function TeamCard({
  team,
  name: nameProp,
  piName: piNameProp,
  description: descProp,
  imageUrl: imageUrlProp,
  href: hrefProp,
  fields = [],
  showDescription = true,
}) {
  // Allow passing a full team object for convenience
  const a = team ? (team.attributes || team) : null;
  const name = nameProp ?? a?.name;
  const piName = piNameProp ?? a?.pi_name;
  const description = descProp ?? a?.description;
  let imageUrl = imageUrlProp;
  if (!imageUrl && a) {
    const rel = a.photo?.data?.[0]?.attributes?.url
      || (Array.isArray(a.photo) ? a.photo[0]?.url : a.photo?.url)
      || "";
    imageUrl = rel ? (rel.startsWith("http") ? rel : `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${rel}`) : undefined;
  }
  const href = hrefProp ?? (a?.slug ? `/team/${a.slug}` : undefined);
  const summary = description ? excerpt(description, 220) : "";
  return (
    <a href={href} className="block overflow-hidden rounded-lg border border-border bg-card shadow-card transition hover:shadow-md">
      {imageUrl && (
        <img src={imageUrl} alt={name} className="h-40 w-full object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold">{name}</h3>
          {piName && <span className="shrink-0 text-xs text-muted">PI: {piName}</span>}
        </div>
        {showDescription && summary && (
          <p
            className="mt-2 text-muted"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {summary}
          </p>
        )}
        {Array.isArray(fields) && fields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((f, i) => (
              <span key={`${f}-${i}`} className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
