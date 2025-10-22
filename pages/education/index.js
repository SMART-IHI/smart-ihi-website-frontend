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
							slug={p.attributes.slug}
						/>
					))}
				</div>
			</section>
			<Footer />
		</div>
	);
}

export async function getStaticProps({ locale }) {
	const programs = await fetchStrapi("education-programs", locale);
	return {
		props: {
			programs,
			...(await serverSideTranslations(locale, ["common"])),
		},
		revalidate: 10,
	};
}

