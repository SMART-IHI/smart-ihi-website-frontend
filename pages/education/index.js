import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EducationCard from "../../components/EducationCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { normalizeAssetUrl } from "../../lib/text";
import { useTranslation } from "next-i18next";

export default function Education({ programs = [] }) {
	const { t } = useTranslation("common");
	return (
		<div>
			<Header />
			<section className="max-w-6xl mx-auto p-10">
				<h2 className="mb-6 font-serif text-3xl text-primary">{t("education", "Education")}</h2>
				{(!Array.isArray(programs) || programs.length === 0) ? (
					<p className="text-muted">{t("no_programs", "No education programs found.")}</p>
				) : (
					<div className="grid md:grid-cols-3 gap-6">
						{programs.map((p) => {
							const a = p?.attributes || p || {};
							// Resolve first image from 'image' (multi-media)
							const img = a.image || {};
							const rel = img?.data?.[0]?.attributes?.url
								|| img?.data?.attributes?.url
								|| (Array.isArray(img) ? img[0]?.url : img?.url)
								|| "";
							const path = normalizeAssetUrl(rel);
							const imageUrl = path ? (path.startsWith("http") ? path : path) : undefined;
							return (
								<EducationCard
									key={p.id}
									title={a.title}
									description={a.description}
									imageUrl={imageUrl}
									link={a.link}
								/>
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
	// Fetch the Education collection from Strapi; use locale="all" to surface content regardless of locale status
	const programs = await fetchStrapi("educations", "all");
		return {
			props: {
				programs,
				...(await serverSideTranslations(locale, ["common"]))
			},
			revalidate: 10,
		};
	} catch (e) {
		return {
			props: {
				programs: [],
				...(await serverSideTranslations(locale, ["common"]))
			},
			revalidate: 10,
		};
	}
}

