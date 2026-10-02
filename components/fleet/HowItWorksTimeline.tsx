const steps = [
  ['Select Fleet', 'Choose the required commercial vehicles.'],
  ['Get Scored', 'Business and fleet financing eligibility are assessed.'],
  ['Finance & Deploy', 'Approved lease-to-own financing is structured and activated.'],
  ['Own & Scale', 'Make scheduled payments, gain ownership, and grow the fleet.'],
];

export function HowItWorksTimeline() {
  return (
    <div className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B]/80 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">How It Works</p>
      <h2 className="mt-2 text-2xl font-semibold text-[#F6FFF9]">Simple. Transparent. Tokenized.</h2>
      <ol className="relative mt-6 space-y-5 border-l border-[rgba(112,255,184,0.25)] pl-6">
        {steps.map(([title, body], index) => (
          <li key={title} className="relative">
            <span className="absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full bg-[#16A86B] text-xs font-semibold text-[#07120F]">
              {index + 1}
            </span>
            <p className="font-medium text-[#F6FFF9]">{title}</p>
            <p className="text-sm text-[#9FB8AD]">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
