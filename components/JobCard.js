export default function JobCard({ position, description, applyLink }) {
  return (
    <div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-card transition hover:shadow-md">
      <h3 className="text-xl font-semibold">{position}</h3>
      <p className="mt-2 text-muted">{description}</p>
      <a href={applyLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-primary">
        Apply
      </a>
    </div>
  );
}
