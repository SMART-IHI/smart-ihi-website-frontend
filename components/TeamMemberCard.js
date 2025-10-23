export default function TeamMemberCard({ name, title, photo }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 text-center shadow-card transition hover:shadow-md">
      <img
        src={photo || "/images/placeholder.png"}
        alt={name}
        className="mx-auto h-24 w-24 rounded-full object-cover"
      />
      <h4 className="mt-3 font-semibold text-foreground">{name}</h4>
      {title && <p className="text-sm text-muted">{title}</p>}
    </div>
  );
}
