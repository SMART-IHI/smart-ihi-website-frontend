export default function EducationCard({ title, description, slug }) {
	return (
		<a href={`/education/${slug}`}>
			<div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-card transition hover:shadow-md">
				<h3 className="text-xl font-semibold">{title}</h3>
				<p className="mt-2 text-muted">{description}</p>
			</div>
		</a>
	);
}

