import Header from "../../components/Header";
import Footer from "../../components/Footer";
import JobCard from "../../components/JobCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Jobs({ jobs }) {
	return (
		<div>
			<Header />
			<section className="max-w-6xl mx-auto p-10">
			<h2 className="mb-6 font-serif text-3xl text-primary">Open Positions</h2>
				<div>
					{jobs.map((job) => (
						<JobCard
							key={job.id}
							position={job.attributes.position}
							description={job.attributes.description}
							applyLink={job.attributes.applyLink}
						/>)
					)}
				</div>
			</section>
			<Footer />
		</div>
	);
}

export async function getStaticProps({ locale }) {
	const jobs = await fetchStrapi("jobs", locale);
	return {
		props: {
			jobs,
			...(await serverSideTranslations(locale, ["common"])),
		},
		revalidate: 10,
	};
}

