export function FleetTypeCard({
  title,
  useCase,
  image,
}: {
  title: string;
  useCase: string;
  image: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#112720] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(53,244,154,0.2)]">
      <img src={image} alt="" className="h-36 w-full object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-[#F6FFF9]">{title}</h3>
        <p className="mt-1 text-sm text-[#9FB8AD]">{useCase}</p>
        <p className="mt-3 text-xs text-[#70FFB8]">View fleet →</p>
      </div>
    </article>
  );
}
