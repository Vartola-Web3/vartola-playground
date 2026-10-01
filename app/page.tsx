import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            AssetFi UAE 🇦🇪
          </h1>
          <p className="text-xl text-blue-200">
            Tokenized Lease-to-Own Asset Finance on Stellar
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
            <span className="text-yellow-300 font-semibold">⚠️ Testnet Demo Only - No Real Value</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">🎯 Project Status</h2>
              <ul className="space-y-2 text-blue-100">
                <li>✅ Database Schema Complete</li>
                <li>✅ Demo Data Seeded</li>
                <li>✅ Risk Engine Designed</li>
                <li>✅ Architecture Documented</li>
                <li>🚧 UI Development In Progress</li>
                <li>📋 Phase 2: Soroban Contracts</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">🏢 Demo Scenario</h2>
              <div className="space-y-2 text-blue-100">
                <p><strong>Company:</strong> Gulf Logistics LLC</p>
                <p><strong>Asset:</strong> Isuzu NPR Truck</p>
                <p><strong>Value:</strong> AED 300,000</p>
                <p><strong>Finance:</strong> AED 225,000 (75%)</p>
                <p><strong>Term:</strong> 36 months</p>
                <p><strong>Risk Tier:</strong> B</p>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">🔑 Demo Credentials</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-100">
              <div>
                <p className="font-semibold text-white">Admin:</p>
                <p>admin@assetfi.ae / admin123</p>
              </div>
              <div>
                <p className="font-semibold text-white">Underwriter:</p>
                <p>underwriter@assetfi.ae / underwriter123</p>
              </div>
              <div>
                <p className="font-semibold text-white">SME:</p>
                <p>ahmed@gulflogistics.ae / sme123</p>
              </div>
              <div>
                <p className="font-semibold text-white">Investor:</p>
                <p>khalid@investor.ae / investor123</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Launch Demo (Coming Soon)
            </Link>
            <a
              href="https://github.com"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Documentation
            </a>
          </div>

          {/* Tech Stack */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <h3 className="text-center text-lg font-semibold text-white mb-4">
              Built With
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <span className="px-3 py-1 bg-white/10 rounded">Next.js 14</span>
              <span className="px-3 py-1 bg-white/10 rounded">TypeScript</span>
              <span className="px-3 py-1 bg-white/10 rounded">Prisma</span>
              <span className="px-3 py-1 bg-white/10 rounded">SQLite</span>
              <span className="px-3 py-1 bg-white/10 rounded">Tailwind CSS</span>
              <span className="px-3 py-1 bg-white/10 rounded">Stellar Testnet</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-blue-300">
          <p>AssetFi UAE - Phase 1 MVP Foundation</p>
          <p className="text-sm mt-2">Stellar Community Fund Build Award Application</p>
          <p className="text-xs mt-4 text-blue-400">
            ⚠️ Technology Demo Only | No Real Money | Testnet Only
          </p>
        </footer>
      </div>
    </div>
  );
}
