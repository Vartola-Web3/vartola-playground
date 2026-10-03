import Link from 'next/link';
import { FleetMetricStrip } from '@/components/fleet/FleetMetricStrip';
import { HeroFleetScene } from '@/components/fleet/HeroFleetScene';
import { BrandMark } from '@/components/brand/brand-mark';
import { AudiencePanel } from '@/components/landing/audience-panel';
import { HomeShowcase } from '@/components/landing/home-showcase';
import { ExplainerVideo } from '@/components/marketing/explainer-video';
const nav = [
  ['Home', '/'],
  ['How It Works', '/how-it-works'],
  ['Whitepaper', '/whitepaper'],
  ['Pitch Deck', '/pitch'],
  ['Paperwork', '/paperwork'],
  ['About', '/about'],
];

export function LandingPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <header className="vartola-frame flex h-16 items-center justify-between">
        <BrandMark />
        <nav className="hidden gap-6 text-sm text-[#9FB8AD] md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#F6FFF9]">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="rounded-full bg-[#35F49A] px-4 py-2 text-sm font-semibold text-[#07120F]">
          Launch Demo
        </Link>
      </header>

      <main className="vartola-frame space-y-8 py-8 pb-16">
        <HomeShowcase />
        <section className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#35F49A]">Financing productive assets for UAE SMEs</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
              Financing the Assets That Help <span className="text-[#35F49A]">UAE SMEs</span> Grow
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#C5D5CC]">
              We help small and medium businesses access the productive assets they need to operate, grow and generate more revenue — starting with logistics fleets, then expanding into business equipment.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">
                Finance Your Fleet
              </Link>
              <Link href="/marketplace" className="rounded-full border border-[rgba(112,255,184,0.35)] px-5 py-3 text-sm text-[#F6FFF9]">
                Explore Investments
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-[#F6FFF9]">
              {['Real Assets, Real Businesses', 'Built for UAE SMEs', 'Structured, Transparent Finance', 'Powered by Stellar'].map((item) => (
                <li key={item} className="rounded-2xl border border-[rgba(112,255,184,0.16)] bg-[#0E211B]/80 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <HeroFleetScene />
        </section>

        <FleetMetricStrip />

        <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70FFB8]">Delivery timeline</p><h2 className="mt-2 text-3xl font-semibold">Prove the lifecycle, then launch responsibly.</h2></div>
            <div className="flex flex-wrap gap-4">
              <Link href="/pitch" className="text-sm font-medium text-[#70FFB8] underline underline-offset-4">Read the pitch deck</Link>
              <Link href="/paperwork" className="text-sm font-medium text-[#70FFB8] underline underline-offset-4">View public paperwork</Link>
            </div>
          </div>
          <ol className="relative mt-8 grid gap-4 md:grid-cols-4 before:absolute before:left-[12.5%] before:right-[12.5%] before:top-5 before:hidden before:h-px before:bg-[#295143] md:before:block">
            {[
              ['2026 · Complete', 'Product simulation', 'Wallets, funding, installments, fees, and distributions validated.'],
              ['2027 · Build', 'Grant & regulatory design', 'Target up to $150k, partner sandboxes, security assurance, and audited Testnet evidence.'],
              ['2028 · Launch', 'Regulated logistics pilot', 'Target $1.5m seed and $2m separately structured asset capacity.'],
              ['2029–31 · Scale', 'Equipment to real estate', 'UAE scale, GCC readiness, then a separately authorised property pilot.'],
            ].map(([status, title, body], index) => <li key={title} className="relative rounded-2xl border border-[rgba(112,255,184,0.14)] bg-[#091713] p-5 pt-12">
              <span className={`absolute left-5 top-3 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${index < 2 ? 'bg-[#35F49A] text-[#07120F]' : 'border border-[#41705E] bg-[#0E211B] text-[#9FB8AD]'}`}>{index + 1}</span>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#70FFB8]">{status}</p><h3 className="mt-2 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#9FB8AD]">{body}</p>
            </li>)}
          </ol>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">How it works</h2>
            <Link href="/how-it-works" className="text-sm text-[#70FFB8]">Watch the full page</Link>
          </div>
          <ExplainerVideo />
        </section>

        <AudiencePanel />

        <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[linear-gradient(180deg,#0E211B,#07120F)] px-6 py-10">
          <h2 className="max-w-xl text-3xl font-semibold">Financing a More Productive UAE</h2>
          <p className="mt-3 max-w-2xl text-[#9FB8AD]">
            Helping SMEs acquire revenue-generating assets—starting on the road and growing into the workplace.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['Logistics First', 'Equipment Next', 'Real Assets, Real Operations', 'Stronger UAE SMEs'].map((item) => (
              <p key={item} className="rounded-2xl border border-[rgba(112,255,184,0.14)] px-4 py-5 text-sm text-[#F6FFF9]">
                {item}
              </p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
