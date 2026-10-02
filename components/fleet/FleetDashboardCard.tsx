export function FleetDashboardCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#132D24] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[#9FB8AD]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#F6FFF9]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#70FFB8]">{hint}</p>}
    </div>
  );
}
