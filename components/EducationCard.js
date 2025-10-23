import { excerpt } from "../lib/text";

export default function EducationCard({ title, description, slug, imageUrl }) {
	const Inner = (
		<div className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition hover:shadow-md">
			{imageUrl && <img src={imageUrl} alt={title} className="h-40 w-full object-cover" />}
			<div className="p-5">
				<h3 className="text-xl font-semibold">{title}</h3>
				{description && (
					<p
						className="mt-2 text-muted"
						style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
					>
						{excerpt(description, 200)}
					</p>
				)}
			</div>
		</div>
	);

	if (slug) {
		return <a href={`/education/${slug}`}>{Inner}</a>;
	}

	return Inner;
}

