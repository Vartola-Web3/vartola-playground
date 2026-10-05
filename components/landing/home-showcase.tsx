export function HomeShowcase() {
  const routes = [
    'M40 120 C 220 40, 360 210, 560 120 S 900 20, 1160 150',
    'M80 560 C 280 470, 460 620, 700 520 S 980 430, 1160 560',
  ];

  return (
    <section className="relative h-[min(52vh,480px)] min-h-[340px] w-full overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.16)] bg-[#071a14]">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(53,244,154,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(53,244,154,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {routes.map((path) => (
            <path key={path} className="vartola-dash" d={path} fill="none" stroke="#35F49A" strokeWidth="2" />
          ))}
          <path className="vartola-dash" d="M20 340 C 180 250, 260 430, 480 340" fill="none" stroke="#70FFB8" strokeWidth="2" />
          {routes.map((path, index) => (
            <g key={path} className="vartola-truck" style={{ offsetPath: `path('${path}')`, animationDelay: `${index * -3}s` }}>
              <rect x="-16" y="-10" width="28" height="16" rx="3" fill="#35F49A" />
              <rect x="8" y="-7" width="10" height="10" rx="2" fill="#70FFB8" />
            </g>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="flex items-center gap-3">
            <img src="/brand/vartola-logo.png" alt="" className="h-14 w-14 rounded-2xl shadow-[0_0_40px_rgba(53,244,154,0.45)]" />
            <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">Vartola</p>
          </div>
          <p className="mt-4 text-lg text-[#D7E7DF] sm:text-2xl">Productive asset finance, made transparent.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            {['Real assets', 'Clear terms', 'Every payment recorded', 'Stellar Testnet'].map((item) => (
              <span key={item} className="rounded-full border border-[#35F49A]/50 px-3 py-1 text-[#E8FFF4]">{item}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .vartola-dash { stroke-dasharray: 8 10; animation: vartola-dash 8s linear infinite; }
        .vartola-truck { offset-rotate: auto; animation: vartola-truck 9s linear infinite; }
        @keyframes vartola-dash { to { stroke-dashoffset: -180; } }
        @keyframes vartola-truck { to { offset-distance: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .vartola-dash, .vartola-truck { animation: none; }
        }
      `}</style>
    </section>
  );
}
