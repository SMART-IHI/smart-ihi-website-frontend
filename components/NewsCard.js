import { excerpt } from "../lib/text";

export default function NewsCard({ title, summary, slug, date, imageUrl, category }) {
  const Card = (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition hover:shadow-md">
      {imageUrl && <img src={imageUrl} alt={title} className="h-40 w-full object-cover" />}
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          {category && (
            <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">{category}</span>
          )}
        </div>
        {date && <p className="mt-1 text-sm text-muted">{date}</p>}
        {summary && (
          <p
            className="mt-2 text-muted"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {excerpt(summary, 200)}
          </p>
        )}
      </div>
    </div>
  );

  return slug ? <a href={`/news/${slug}`}>{Card}</a> : Card;
}
