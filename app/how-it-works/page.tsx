import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

const operatorSteps = [
  ['Apply', 'Tell us the vehicles you need, how many, and the term.'],
  ['Review', 'We look at the business, the fleet, and the documents.'],
  ['Finance', 'An approved request becomes a lease on those vehicles.'],
  ['Operate', 'Take delivery, then pay on the schedule until the fleet is yours.'],
];

const investorSteps = [
  ['Browse', 'Open opportunities backed by productive assets used by UAE SMEs.'],
  ['Invest', 'Choose an amount. Your cash stays reserved until the vehicles are in use.'],
  ['Earn', 'Income starts after the fleet is active and the business begins paying.'],
  ['Track', 'See your investments, income, and the next payment in one place.'],
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#07120F] text-[#F6FFF9]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">How it works</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Two simple paths. One productive asset.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#9FB8AD]">
          A business finances the assets it needs to operate. An investor funds the opportunity and receives income as the lease is paid. Vartola starts with logistics fleets, then expands into business equipment.
        </p>

        <section className="mt-12 overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B]">
          <img src="/fleet/hero.jpg" alt="UAE commercial fleet" className="h-64 w-full object-cover sm:h-80" />
          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">If you run a business</p>
              <h2 className="mt-2 text-2xl font-semibold">Finance the asset. Put it to work. Own it.</h2>
              <ol className="mt-6 space-y-4">
                {operatorSteps.map(([title, body], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#35F49A] text-sm font-semibold text-[#07120F]">{index + 1}</span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-[#9FB8AD]">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/register" className="mt-6 inline-block rounded-full bg-[#35F49A] px-5 py-2.5 text-sm font-semibold text-[#07120F]">
                Apply as a business
              </Link>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#70FFB8]">If you invest</p>
              <h2 className="mt-2 text-2xl font-semibold">Fund a real fleet. Receive the income.</h2>
              <ol className="mt-6 space-y-4">
                {investorSteps.map(([title, body], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#35F49A] text-sm font-semibold text-[#07120F]">{index + 1}</span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-[#9FB8AD]">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/login" className="mt-6 inline-block rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-2.5 text-sm font-semibold text-[#F6FFF9]">
                Open the investor demo
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['/fleet/moto.jpg', 'Last mile', 'Motorcycles and vans for delivery businesses.'],
            ['/fleet/van.jpg', 'Cargo', 'Vans and pickups for growing operators.'],
            ['/fleet/truck.jpg', 'Distribution', 'Small and medium trucks for logistics routes.'],
          ].map(([image, title, body]) => (
            <article key={title} className="overflow-hidden rounded-3xl border border-[rgba(112,255,184,0.14)] bg-[#091713]">
              <img src={image} alt="" className="h-40 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[#9FB8AD]">{body}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
