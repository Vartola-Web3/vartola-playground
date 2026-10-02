'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const demoCredentials = [
  { role: 'Admin', email: 'admin@assetfi.ae', password: 'admin123' },
  { role: 'Underwriter', email: 'underwriter@assetfi.ae', password: 'underwriter123' },
  { role: 'SME', email: 'ahmed@gulflogistics.ae', password: 'sme123' },
  { role: 'Investor', email: 'khalid@investor.ae', password: 'investor123' },
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

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 rounded-full bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-900">
          Testnet demo only. No real value.
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold text-[#0B1F4D]">AssetFi UAE</CardTitle>
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

              <Button type="submit" className="w-full bg-[#1D4ED8] hover:bg-[#1e40af]" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#E2E8F0] pt-6">
              <p className="mb-3 text-center text-sm text-[#475569]">Demo accounts</p>
              <div className="grid grid-cols-2 gap-2">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => quickLogin(cred.email, cred.password)}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] p-3 text-left text-xs transition-colors hover:border-[#1D4ED8]"
                  >
                    <div className="font-semibold text-[#0F172A]">{cred.role}</div>
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
          <p className="text-xs text-[#475569]">AssetFi UAE — institutional asset finance</p>
        </div>
      </div>
    </div>
  );
}
