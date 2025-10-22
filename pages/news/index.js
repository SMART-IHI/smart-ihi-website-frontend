import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NewsCard from "../../components/NewsCard";
import { fetchStrapi } from "../../lib/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function News({ fields }) {
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
  <h2 className="mb-6 font-serif text-3xl text-primary">News</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {fields.map((field) => (
            <NewsCard
              title={field.id}
              summary={field.attributes.summary}
              slug={field.attributes.slug}
              date={field.attributes.date}
            />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  const fields = await fetchStrapi("news", locale);
  return {
    props: {
  fields,
  ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 10,
  };
}
