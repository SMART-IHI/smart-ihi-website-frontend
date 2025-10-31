import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { fetchStrapi } from "../../lib/api";
import { renderMaybeMarkdown, normalizeAssetUrl } from "../../lib/text";

export default function About({ about }) {
	const a = about?.attributes || about || {};
	// address is media[] per schema; render thumbnails if present
	const addrMedia = a.address?.data || a.address || [];
	const images = Array.isArray(addrMedia) ? addrMedia : [addrMedia];
	return (
		<div>
			<Header />
			<section className="mx-auto max-w-4xl p-10">
				<h2 className="mb-2 font-serif text-3xl text-primary">{a.title || "About Us"}</h2>
				{a.email && (
					<p className="mb-4 text-sm text-muted">
						Email: <a className="text-primary hover:underline" href={`mailto:${a.email}`}>{a.email}</a>
					</p>
				)}
				{a.content && (
					<div
						className="prose prose-neutral dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: renderMaybeMarkdown(a.content) }}
					/>
				)}
				{images.length > 0 && (
					<div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
						{images.map((img, i) => {
							const u = img?.attributes?.url || img?.url;
							if (!u) return null;
							const path = normalizeAssetUrl(u);
							const src = path ? (path.startsWith("http") ? path : path) : undefined;
							return (
								<img key={i} src={src} alt={img?.attributes?.alternativeText || "Address media"} className="h-28 w-full rounded object-cover" />
							);
						})}
					</div>
				)}
			</section>
			<Footer />
		</div>
	);
}

export async function getStaticProps({ locale }) {
	try {
		const abouts = await fetchStrapi("about", "all");
		const target = Array.isArray(abouts)
			? (abouts.find((x) => (x.attributes?.locale || x.locale) === locale) || abouts[0])
			: abouts;
		return {
			props: {
				about: target || null,
				...(await serverSideTranslations(locale, ["common"]))
			},
			revalidate: 60,
		};
	} catch (e) {
		return {
			props: {
				about: null,
				...(await serverSideTranslations(locale, ["common"]))
			},
			revalidate: 60,
		};
	}
}

