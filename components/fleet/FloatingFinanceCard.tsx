export function FloatingFinanceCard({
  title,
  units,
  status = 'In scope',
  className = '',
}: {
  title: string;
  units?: string;
  status?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(112,255,184,0.28)] bg-[#07120F]/75 px-3 py-2.5 shadow-[0_0_24px_rgba(53,244,154,0.16)] backdrop-blur-md ${className}`}
    >
      <p className="text-xs font-medium text-[#F6FFF9]">{title}</p>
      {units && <p className="text-sm font-semibold text-[#35F49A]">{units}</p>}
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#9FB8AD]">{status}</p>
    </div>
  );
}
