const metrics = [
  { value: 'Alpha', label: 'Working platform' },
  { value: 'Fleets', label: 'First asset class' },
  { value: 'Testnet', label: 'Stellar rail' },
  { value: 'VTAED', label: 'No cash value' },
  { value: 'Gated', label: 'Mainnet later' },
];

export function FleetMetricStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-4 md:grid-cols-5">
      {metrics.map((item) => (
        <div key={item.label} className="px-2 py-2">
          <p className="text-2xl font-semibold text-[#F6FFF9]">{item.value}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#9FB8AD]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
