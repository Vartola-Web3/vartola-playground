import { FloatingFinanceCard } from '@/components/fleet/FloatingFinanceCard';

export function HeroFleetScene() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.16)] bg-[#091713]">
      <img src="/fleet/hero.jpg" alt="Tokenized UAE commercial fleet" className="h-full min-h-[420px] w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#07120F] via-[#07120F]/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(53,244,154,0.22),transparent_42%)]" />
      <FloatingFinanceCard title="Motorcycle Fleet" units="120 Units" className="absolute left-[6%] top-[38%] hidden sm:block" />
      <FloatingFinanceCard title="Cargo Vans" units="85 Units" className="absolute left-[28%] top-[8%] hidden md:block" />
      <FloatingFinanceCard title="Pickup Fleet" units="40 Units" className="absolute right-[24%] top-[14%] hidden lg:block" />
      <FloatingFinanceCard title="Trucks" units="25 Units" className="absolute right-[8%] top-[38%] hidden md:block" />
      <FloatingFinanceCard title="Business Equipment" status="Next phase" className="absolute right-[4%] top-[62%] hidden lg:block" />
    </div>
  );
}
