import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Resources() {
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
  <h2 className="mb-6 font-serif text-3xl text-primary">Resources</h2>
        <p className="text-gray-700">Resources will be published here soon.</p>
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
