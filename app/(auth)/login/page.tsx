'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const demoCredentials = [
  { role: 'Investor', name: 'Khalid Al Fahim', email: 'khalid@investor.ae', password: 'demo123' },
  { role: 'Investor', name: 'Fatima Al Zahra', email: 'fatima@investor.ae', password: 'demo123' },
  { role: 'Investor', name: 'Mohammed Al Rashid', email: 'mohammed@investor.ae', password: 'demo123' },
  { role: 'Investor', name: 'Sara Al Hashimi', email: 'sara@investor.demo', password: 'demo123' },
  { role: 'SME', name: 'Falcon Route · Dubai', email: 'layla@falconroute.demo', password: 'demo123' },
  { role: 'SME', name: 'Desert Mile · Abu Dhabi', email: 'omar@desertmile.demo', password: 'demo123' },
  { role: 'SME', name: 'Harbour Cold Chain · Sharjah', email: 'noor@harbourcoldchain.demo', password: 'demo123' },
  { role: 'Underwriter', name: 'Mariam', email: 'underwriter@assetfi.ae', password: 'demo123' },
  { role: 'Admin', name: 'Vartola Admin', email: 'admin@assetfi.ae', password: 'demo123' },
  { role: 'Operations Admin', name: 'Operations Admin', email: 'operations@vartola.demo', password: 'demo123' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Redirect based on role (will be handled by middleware)
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('This demo account is not seeded yet. Run the demo data seed.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07120F] p-4 text-[#F6FFF9]">
      <div className="w-full max-w-2xl">
        <div className="mb-4 rounded-full bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-900">
          Testnet demo only. No real value.
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold text-[#13251E]">Vartola</CardTitle>
            <CardDescription className="text-center">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#0F172A]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#E2E8F0] pt-6">
              <p className="mb-3 text-center text-sm text-[#475569]">Demo accounts</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => quickLogin(cred.email, cred.password)}
                    className="rounded-xl border border-[#DCE6E1] bg-[#F8FBF9] p-3 text-left text-xs text-[#13251E] transition-colors hover:border-[#15C77A]"
                  >
                    <div className="font-semibold text-[#0F172A]">{cred.name}</div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-[#0D7A52]">{cred.role}</div>
                    <div className="truncate text-[#475569]">{cred.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-2 text-center">
          <div className="flex justify-center gap-4 text-xs">
            <a href="/how-it-works" className="text-[#1D4ED8]">How It Works</a>
            <a href="/about" className="text-[#1D4ED8]">About</a>
            <a href="/whitepaper" className="text-[#1D4ED8]">Whitepaper</a>
          </div>
          <p className="text-xs text-[#475569]">Vartola — productive asset finance for UAE SMEs</p>
        </div>
      </div>
    </div>
  );
}
