'use client';


import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const demoPassword = 'demo123';

const demoGroups = [
  {
    role: 'Investor',
    tone: 'bg-[#E7F8EF] text-[#0D7A52]',
    users: [
      { name: 'Fatima Al Zahra', email: 'fatima@investor.ae' },
      { name: 'Khalid Al Fahim', email: 'khalid@investor.ae' },
      { name: 'Mohammed Al Rashid', email: 'mohammed@investor.ae' },
      { name: 'Sara Al Hashimi', email: 'sara@investor.demo' },
    ],
  },
  {
    role: 'SME',
    tone: 'bg-[#E8F1FF] text-[#2563EB]',
    users: [
      { name: 'Desert Mile', email: 'omar@desertmile.demo' },
      { name: 'Falcon Route', email: 'layla@falconroute.demo' },
      { name: 'Harbour Cold Chain', email: 'noor@harbourcoldchain.demo' },
    ],
  },
  {
    role: 'Underwriter',
    tone: 'bg-[#F3E8FF] text-[#7C3AED]',
    users: [{ name: 'Mariam', email: 'underwriter@assetfi.ae' }],
  },
  {
    role: 'Operations Admin',
    tone: 'bg-[#FFF4E5] text-[#C2410C]',
    users: [{ name: 'Operations Admin', email: 'operations@vartola.demo' }],
  },
];

const chips = [
  { label: 'Capital Flows', className: 'left-1 top-2' },
  { label: 'Real Assets', className: 'right-0 top-[38%]' },
  { label: 'Trusted Ecosystem', className: 'bottom-4 left-0' },
  { label: 'Growth Together', className: 'bottom-1 right-1' },
];

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function RoleIcon({ role }: { role: string }) {
  if (role === 'SME') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 20V7l8-3 8 3v13" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }
  if (role === 'Operations Admin') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
      </svg>
    );
  }
  if (role === 'Underwriter') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
        <path d="M14 3.5V8h4.5M8 12h8M8 16h6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="2.2" />
      <circle cx="16" cy="9" r="1.8" />
      <path d="M4.5 18.5c.6-2.4 2.4-3.7 4.5-3.7s3.9 1.3 4.5 3.7" />
      <path d="M14 14.9c1.5-.2 3 .6 3.8 2.6" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Record<string, string>>(() =>
    Object.fromEntries(demoGroups.map((group) => [group.role, group.users[0].email])),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        totp: totp.trim(),
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email, password, or authentication code');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred');
      setLoading(false);
    }
  };

  const quickLogin = async (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email: nextEmail, password: nextPassword, redirect: false });
    if (result?.error) {
      setError('This demo account is not seeded yet. Run the demo data seed.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#07120F] lg:flex lg:items-center lg:justify-center lg:p-8">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl overflow-hidden bg-white lg:min-h-[820px] lg:rounded-[28px] lg:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <section className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-[#063426] px-9 py-10 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_82%,rgba(53,244,154,0.22),transparent_36%)]" />
          <div className="relative">
            <Link href="/" className="flex items-center gap-3">
              <img src="/brand/vartola-logo.png" alt="" className="h-12 w-12 rounded-2xl" />
              <span className="text-xl font-semibold">Vartola</span>
            </Link>
            <h1 className="mt-12 text-[3.15rem] font-semibold leading-[0.98] tracking-tight">
              Asset<br />
              finance for a<br />
              more<br />
              <span className="text-[#3EF59A]">productive<br />world</span>
            </h1>
            <p className="mt-6 max-w-[15rem] text-[15px] leading-6 text-[#D7E6DE]">
              Connecting capital and the real economy through technology.
            </p>
          </div>
          <div className="relative mx-auto h-[270px] w-full max-w-[340px]">
            <div className="absolute left-1/2 top-[46%] h-40 w-40 -translate-x-[72%] -translate-y-1/2 -rotate-12 rounded-[32px] border border-[#7CFFC4]/25 bg-[#35F49A]/10" />
            <div className="absolute left-1/2 top-[42%] h-40 w-40 -translate-x-[46%] -translate-y-[58%] rotate-6 rounded-[32px] border border-[#7CFFC4]/30 bg-[#0C4A34]/80" />
            <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[36px] border border-[#3EF59A]/70 bg-[#071F18] shadow-[0_0_46px_rgba(62,245,154,0.45)]">
              <span className="text-7xl font-semibold leading-none text-[#3EF59A]">V</span>
            </div>
            {chips.map((chip) => (
              <span key={chip.label} className={`absolute ${chip.className} rounded-full border border-white/10 bg-[#07120F]/75 px-3 py-1.5 text-xs text-[#E7F6EF] backdrop-blur`}>
                {chip.label}
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-[#FFF6E8] px-3 py-1.5 text-xs font-medium text-[#9A6700]">
            <span aria-hidden="true">⚠</span>
            Testnet demo only. No real value.
          </div>
          <div className="text-center">
            <img src="/brand/vartola-logo.png" alt="" className="mx-auto h-14 w-14 rounded-2xl" />
            <h2 className="mt-3 text-2xl font-semibold text-[#13251E]">Vartola</h2>
            <p className="mt-1 text-sm text-[#708078]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full max-w-md space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#13251E]">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#93A29B]"><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-[#DCE6E1] bg-white pl-10 pr-3 text-sm text-[#13251E] outline-none focus:ring-2 focus:ring-[#15C77A]/35"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#13251E]">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#93A29B]"><LockIcon /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-[#DCE6E1] bg-white pl-10 pr-11 text-sm text-[#13251E] outline-none focus:ring-2 focus:ring-[#15C77A]/35"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93A29B]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="totp" className="text-sm font-medium text-[#13251E]">Authentication code <span className="font-normal text-[#708078]">(administrators)</span></label>
              <input id="totp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={totp} onChange={(e) => setTotp(e.target.value)} className="h-11 w-full rounded-xl border border-[#DCE6E1] bg-white px-3 text-sm text-[#13251E] outline-none focus:ring-2 focus:ring-[#15C77A]/35" />
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0E9F6E] text-sm font-semibold text-white hover:bg-[#0B8A5F] disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="mx-auto mt-8 w-full max-w-md">
            <div className="mb-4 flex items-center gap-3 text-xs text-[#93A29B]">
              <span className="h-px flex-1 bg-[#E5ECE8]" />
              Demo / Test Data
              <span className="h-px flex-1 bg-[#E5ECE8]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {demoGroups.map((group) => {
                const email = picked[group.role];
                return (
                  <div key={group.role} className="rounded-2xl border border-[#E5ECE8] bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${group.tone}`}>
                        <RoleIcon role={group.role} />
                      </span>
                      <span className="text-sm font-semibold text-[#13251E]">{group.role}</span>
                    </div>
                    {group.users.length > 1 ? (
                      <select
                        aria-label={`${group.role} demo account`}
                        value={email}
                        onChange={(event) => setPicked((current) => ({ ...current, [group.role]: event.target.value }))}
                        className="mt-3 h-9 w-full rounded-lg border border-[#DCE6E1] bg-white px-2 text-xs text-[#13251E]"
                      >
                        {group.users.map((user) => (
                          <option key={user.email} value={user.email}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-3 truncate text-[11px] text-[#708078]">{group.users[0].email}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => quickLogin(email, demoPassword)}
                      className="mt-3 w-full rounded-full border border-[#DCE6E1] py-1.5 text-xs font-semibold text-[#0A4934] hover:border-[#15C77A]"
                    >
                      Sign in
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
