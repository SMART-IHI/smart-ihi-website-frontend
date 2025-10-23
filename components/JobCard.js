import { excerpt } from "../lib/text";

export default function JobCard({ position, description, applyLink, location, type }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{position}</h3>
        {(location || type) && (
          <span className="shrink-0 text-xs text-muted">{[location, type].filter(Boolean).join(" • ")}</span>
        )}
      </div>
      {description && (
        <p
          className="mt-2 text-muted"
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {excerpt(description, 220)}
        </p>
      )}
      {applyLink && (
        <a href={applyLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-primary">
          Apply
        </a>
      )}
    </div>
  );
}
