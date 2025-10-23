import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function NewsDetail({ item }) {
	if (!item) return null;
	const { title, date, content } = item.attributes;
	return (
		<div>
			<Header />
			<section className="mx-auto max-w-3xl p-10">
				<h1 className="mb-2 text-3xl font-serif text-primary">{title}</h1>
				<p className="mb-6 text-sm text-muted">{new Date(date).toLocaleDateString()}</p>
				<article className="prose">
					{/* content is richtext (HTML string) in Strapi */}
					<div dangerouslySetInnerHTML={{ __html: content }} />
				</article>
			</section>
			<Footer />
		</div>
	);
}

export async function getStaticPaths() {
	const items = await fetchStrapi("news", "en");
	const paths = items.map((n) => ({ params: { slug: n.attributes.slug } }));
	return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params, locale }) {
	const items = await fetchStrapi(`news?filters[slug][$eq]=${params.slug}`, locale);
	const item = items[0] || null;
	if (!item) return { notFound: true, revalidate: 10 };
	return {
		props: {
			item,
			...(await serverSideTranslations(locale, ["common"]))
		},
		revalidate: 10,
	};
}

