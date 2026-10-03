import Link from 'next/link';
import { FleetDashboardCard } from '@/components/fleet/FleetDashboardCard';
import { FleetMetricStrip } from '@/components/fleet/FleetMetricStrip';
import { FleetTypeCard } from '@/components/fleet/FleetTypeCard';
import { HeroFleetScene } from '@/components/fleet/HeroFleetScene';
import { HowItWorksTimeline } from '@/components/fleet/HowItWorksTimeline';
import { VehicleCard } from '@/components/fleet/VehicleCard';

const nav = [
  ['Home', '/'],
  ['How It Works', '/how-it-works'],
  ['Whitepaper', '/whitepaper'],
  ['Paperwork', '/paperwork'],
  ['About', '/about'],
];

const types = [
  ['Delivery Motorcycles', 'Last-mile delivery fleets', '/fleet/moto.jpg'],
  ['Cargo Vans', 'E-commerce & logistics', '/fleet/van.jpg'],
  ['Pickup Fleets', 'Field operations & SME use', '/fleet/pickup.jpg'],
  ['Small & Medium Trucks', 'Distribution & transport', '/fleet/truck.jpg'],
];

const fleet = [
  ['Motorcycles', '120 units', '95% Operational', '/fleet/moto.jpg'],
  ['Cargo Vans', '85 units', '97% Operational', '/fleet/van.jpg'],
  ['Pickup Fleets', '40 units', '93% Operational', '/fleet/pickup.jpg'],
  ['Trucks', '25 units', '100% Operational', '/fleet/truck.jpg'],
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07120F] text-[#F6FFF9]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-wide text-[#70FFB8]">
          Vartola
        </Link>
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

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-16 sm:px-6">
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
            <Link href="/paperwork" className="text-sm font-medium text-[#70FFB8] underline underline-offset-4">View public paperwork</Link>
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

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Where We Start</h2>
              <span className="text-xs text-[#70FFB8]">Logistics today · equipment next</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {types.map(([title, useCase, image]) => (
                <FleetTypeCard key={title} title={title} useCase={useCase} image={image} />
              ))}
            </div>
          </div>
          <HowItWorksTimeline />
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713]">
          <div className="grid lg:grid-cols-[220px_1fr]">
            <aside className="border-b border-[rgba(112,255,184,0.12)] p-5 lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold text-[#70FFB8]">Vartola</p>
              <ul className="mt-6 space-y-2 text-sm text-[#9FB8AD]">
                {['Dashboard', 'My Fleet', 'Payments', 'Contracts', 'Documents', 'Activity', 'Settings'].map((item, index) => (
                  <li key={item} className={index === 0 ? 'rounded-xl bg-[#132D24] px-3 py-2 text-[#F6FFF9]' : 'px-3 py-2'}>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <span className="text-xs text-[#9FB8AD]">Fleet owner preview</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FleetDashboardCard label="Fleet Units" value="245" hint="+12%" />
                <FleetDashboardCard label="Active Facilities" value="3" hint="Active" />
                <FleetDashboardCard label="Upcoming Payment" value="AED 320,000" hint="in 5 days" />
                <FleetDashboardCard label="Fleet Status" value="96%" hint="Operational" />
              </div>
              <h3 className="mb-3 mt-6 text-sm uppercase tracking-[0.14em] text-[#9FB8AD]">Your Fleet</h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {fleet.map(([title, units, status, image]) => (
                  <VehicleCard key={title} title={title} units={units} status={status} image={image} />
                ))}
              </div>
            </div>
          </div>
        </section>

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
