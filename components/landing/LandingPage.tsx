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
          AssetFi UAE
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
            <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Real vehicles. Real businesses. Tokenized finance.</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              The Future of <span className="text-[#35F49A]">Fleet Finance</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-[#9FB8AD]">
              Tokenized lease-to-own financing for UAE delivery and transport fleets, powered by Stellar.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">
                Launch Demo
              </Link>
              <Link href="/whitepaper" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm text-[#F6FFF9]">
                View Whitepaper
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-xs text-[#9FB8AD]">
              {['Real Assets on Blockchain', 'Built for UAE Fleets', 'Shariah-Aligned Finance Options', 'Powered by Stellar'].map((item) => (
                <li key={item} className="rounded-full border border-[rgba(112,255,184,0.14)] px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <HeroFleetScene />
        </section>

        <FleetMetricStrip />

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Fleet Types</h2>
              <span className="text-xs text-[#70FFB8]">Commercial vehicles only</span>
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
              <p className="text-sm font-semibold text-[#70FFB8]">AssetFi UAE</p>
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
          <h2 className="max-w-xl text-3xl font-semibold">Financing the Movement of a Stronger UAE</h2>
          <p className="mt-3 max-w-2xl text-[#9FB8AD]">
            Empowering businesses. Enabling opportunities. Tokenizing real fleet impact.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['A Smarter Fleet Economy', 'More Businesses On The Move', 'Real Assets, Real Operations', 'A Stronger UAE Tomorrow'].map((item) => (
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
