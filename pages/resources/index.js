import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { fetchStrapi } from "../../lib/api";

export default function Resources({ resources }) {
  return (
    <div>
      <Header />
      <section className="mx-auto max-w-6xl p-10">
        <h2 className="mb-6 font-serif text-3xl text-primary">Resources</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((r) => {
            const imgUrl = r.attributes.image?.data?.[0]?.attributes?.url;
            return (
              <a
                key={r.id}
                href={r.attributes.link}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-card p-4 shadow-card transition hover:shadow-md"
             >
                <div className="flex items-center gap-4">
                  {imgUrl && (
                    <img src={imgUrl} alt={r.attributes.name} className="h-14 w-14 rounded object-cover" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{r.attributes.name}</h3>
                    <p className="line-clamp-2 text-sm text-muted">{r.attributes.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  const resources = await fetchStrapi("resources", locale);
  return {
    props: {
      resources,
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 60,
  };
}
