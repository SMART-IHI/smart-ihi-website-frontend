export default function TeamMemberCard({ name, title, photo }) {
  return (
    <div className="border rounded-lg p-4 text-center hover:shadow-lg transition">
      <img src={photo || "/images/placeholder.png"} alt={name} className="mx-auto rounded-full w-24 h-24" />
      <h4 className="mt-2 font-semibold">{name}</h4>
      <p className="text-gray-600">{title}</p>
    </div>
  );
}
