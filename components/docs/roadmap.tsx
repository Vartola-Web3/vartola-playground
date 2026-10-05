import { ROADMAP } from '@/lib/docs/product';

export function RoadmapTimeline() {
  return (
    <ol className="relative mt-6 space-y-4 border-l border-[rgba(112,255,184,0.25)] pl-6">
      {ROADMAP.map((item, index) => (
        <li key={item.when} className="relative rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-5">
          <span
            className={`absolute -left-[31px] top-6 h-3 w-3 rounded-full ${index === 0 ? 'bg-[#35F49A]' : item.when === 'Mainnet' ? 'bg-amber-200' : 'border border-[#70FFB8] bg-[#07120F]'}`}
          />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${item.when === 'Mainnet' ? 'text-amber-200' : 'text-[#70FFB8]'}`}>{item.when}</p>
            <h3 className="font-semibold">{item.title}</h3>
            {index === 0 ? <span className="rounded-full bg-[#35F49A]/15 px-2 py-0.5 text-[11px] font-semibold text-[#9DFFD2]">NOW</span> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{item.body}</p>
          {item.points.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {item.points.map((point) => (
                <li key={point} className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#D7E7DF]">{point}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
