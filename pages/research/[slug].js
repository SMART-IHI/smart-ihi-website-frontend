import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeamMemberCard from "../../components/TeamMemberCard";
import { fetchStrapi } from "../../lib/api";

export default function ResearchDetail({ field, teams }) {
  return (
    <div>
      <Header />
      <section className="max-w-6xl mx-auto p-10">
        <h2 className="text-3xl font-serif mb-4">{field.attributes.title}</h2>
        <p className="mb-6">{field.attributes.description}</p>
        <h3 className="text-2xl mb-4">Team Members</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {teams.map((member) => (
            <TeamMemberCard
              key={member.id}
              name={member.attributes.name}
              title={member.attributes.title}
              photo={member.attributes.photo?.data?.attributes?.url}
            />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const fields = await fetchStrapi("research-fields", "en"); // use default EN for paths
  const paths = fields.map((f) => ({ params: { slug: f.attributes.slug } }));
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params, locale }) {
  const fields = await fetchStrapi(`research-fields?filters[slug][$eq]=${params.slug}`, locale);
  const field = fields[0];
  const teams = await fetchStrapi(`research-teams?filters[field][slug][$eq]=${params.slug}`, locale);
  return { props: { field, teams }, revalidate: 10 };
}
