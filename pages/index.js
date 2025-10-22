import Header from "../components/Header";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import ResearchCard from "../components/ResearchCard";
import { fetchStrapi } from "../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home({ researchFields }) {
  return (
    <div>
      <Header />
      <Banner />
      <section className="mx-auto max-w-6xl p-10">
  <h2 className="mb-6 font-serif text-3xl text-primary">Our Research Fields</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {researchFields.map((field) => (
            <ResearchCard
              key={field.id}
              title={field.attributes.title}
              description={field.attributes.description}
              slug={field.attributes.slug}
            />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

// Fetch research fields from Strapi
export async function getStaticProps({ locale }) {
  const researchFields = await fetchStrapi("research-fields", locale);
  return {
    props: {
  researchFields,
  ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 10, // ISR
  };
}
