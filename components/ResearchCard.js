import { excerpt } from "../lib/text";

export default function ResearchCard({ title, description, slug, imageUrl }) {
  const Card = (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition-transform hover:-translate-y-1 hover:shadow-md">
      {imageUrl && <img src={imageUrl} alt={title} className="h-40 w-full object-cover" />}
      <div className="p-5">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p
            className="mt-2 text-muted"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {excerpt(description, 160)}
          </p>
        )}
      </div>
    </div>
  );

  return slug ? <a href={`/research/${slug}`}>{Card}</a> : Card;
}
