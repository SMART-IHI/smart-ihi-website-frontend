import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function About() {
	return (
		<div>
			<Header />
			<section className="max-w-4xl mx-auto p-10">
			<h2 className="mb-6 font-serif text-3xl text-primary">About Us</h2>
				<p className="text-gray-700 leading-relaxed">
					We are the Institute of Human Immunology, focusing on fundamental and translational research to improve human health.
				</p>
			</section>
			<Footer />
		</div>
	);
}

export async function getStaticProps({ locale }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"])),
		},
		revalidate: 60,
	};
}

