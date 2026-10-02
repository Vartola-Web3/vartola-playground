import { FleetStatusChip } from '@/components/fleet/FleetStatusChip';

export function VehicleCard({
  title,
  units,
  status,
  image,
  href,
}: {
  title: string;
  units: string;
  status: string;
  image: string;
  href?: string;
}) {
  const body = (
    <article className="overflow-hidden rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#112720] transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(53,244,154,0.18)]">
      <img src={image} alt="" className="h-32 w-full object-cover" />
      <div className="space-y-2 p-4">
        <h3 className="font-semibold text-[#F6FFF9]">{title}</h3>
        <p className="text-sm text-[#9FB8AD]">{units}</p>
        <FleetStatusChip label={status} />
      </div>
    </article>
  );
  if (!href) return body;
  return <a href={href}>{body}</a>;
}
