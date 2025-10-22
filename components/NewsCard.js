export default function NewsCard({ title, summary, slug, date }) {
  return (
    <a href={`/news/${slug}`}>
      <div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-card transition hover:shadow-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted">{date}</p>
        <p className="mt-2 text-muted">{summary}</p>
      </div>
    </a>
  );
}
