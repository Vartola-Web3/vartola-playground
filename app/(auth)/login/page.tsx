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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Testnet Banner */}
        <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-center">
          <span className="text-yellow-300 font-semibold text-sm">
            ⚠️ TESTNET DEMO - NO REAL VALUE
          </span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">AssetFi UAE</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
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
                <label htmlFor="password" className="text-sm font-medium">
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
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-slate-600 mb-3 text-center">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.role}
                    onClick={() => quickLogin(cred.email, cred.password)}
                    className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                  >
                    <div className="font-semibold">{cred.role}</div>
                    <div className="text-slate-500 truncate">{cred.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs">
            <a href="/how-it-works" className="text-blue-300 hover:text-blue-100 underline">
              How It Works
            </a>
            <a href="/about" className="text-blue-300 hover:text-blue-100 underline">
              About
            </a>
            <a href="/whitepaper" className="text-blue-300 hover:text-blue-100 underline">
              Whitepaper
            </a>
          </div>
          <p className="text-xs text-blue-200">
            AssetFi UAE - Institutional Asset Finance Platform
          </p>
        </div>
      </div>
    </div>
  );
}
