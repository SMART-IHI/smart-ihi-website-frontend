import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EducationCard from "../../components/EducationCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Education({ programs }) {
	return (
		<div>
			<Header />
			<section className="max-w-6xl mx-auto p-10">
			<h2 className="mb-6 font-serif text-3xl text-primary">Education Programs</h2>
				<div className="grid md:grid-cols-3 gap-6">
					{programs.map((p) => (
						<EducationCard
							key={p.id}
							title={p.attributes.title}
							description={p.attributes.description}
						/>
					))}
				</div>
			</section>
			<Footer />
		</div>
	);
}

export async function getStaticProps({ locale }) {
	try {
		const programs = await fetchStrapi("educations", locale);
		return {
			props: {
				programs,
				...(await serverSideTranslations(locale, ["common"])),
			},
			revalidate: 10,
		};
	} catch (e) {
		// Graceful fallback if permissions/token misconfigured; render empty list
		return {
			props: {
				programs: [],
				...(await serverSideTranslations(locale, ["common"])),
			},
			revalidate: 10,
		};
	}
}

