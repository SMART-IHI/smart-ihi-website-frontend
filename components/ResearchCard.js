export default function ResearchCard({ title, description, slug }) {
  return (
    <a href={`/research/${slug}`}>
      <div className="rounded-lg border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-1 hover:shadow-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted">{description}</p>
      </div>
    </a>
  );
}
