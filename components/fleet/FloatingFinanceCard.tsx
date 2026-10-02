export function FloatingFinanceCard({
  title,
  units,
  className = '',
}: {
  title: string;
  units: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(112,255,184,0.22)] bg-[#07120F]/70 px-3 py-2 shadow-[0_0_24px_rgba(53,244,154,0.18)] backdrop-blur-md ${className}`}
    >
      <p className="text-[11px] font-medium text-[#F6FFF9]">{title}</p>
      <p className="text-sm font-semibold text-[#70FFB8]">{units}</p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#9FB8AD]">Tokenized</p>
    </div>
  );
}
