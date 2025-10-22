import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ResearchCard from "../../components/ResearchCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Research({ fields }) {
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
  <h2 className="mb-6 font-serif text-3xl text-primary">Research Fields</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {fields.map((field) => (
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

export async function getStaticProps({ locale }) {
  const fields = await fetchStrapi("research-fields", locale);
  return {
    props: {
  fields,
  ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 10,
  };
}
