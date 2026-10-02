export function FleetStatusChip({ label, tone = 'ok' }: { label: string; tone?: 'ok' | 'warn' }) {
  const styles =
    tone === 'warn'
      ? 'border-amber-300/30 bg-amber-400/10 text-amber-100'
      : 'border-[rgba(112,255,184,0.3)] bg-[rgba(53,244,154,0.12)] text-[#70FFB8]';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}>{label}</span>;
}
