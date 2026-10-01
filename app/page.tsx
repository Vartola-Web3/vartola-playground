import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              AssetFi UAE 🇦🇪
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="text-white font-semibold">
                Home
              </Link>
              <Link href="/whitepaper" className="text-blue-200 hover:text-white transition-colors">
                Whitepaper
              </Link>
              <Link href="/pitch" className="text-blue-200 hover:text-white transition-colors">
                Pitch Deck
              </Link>
              <Link href="/documents" className="text-blue-200 hover:text-white transition-colors">
                Documents
              </Link>
              <Link href="/about" className="text-blue-200 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/login" className="text-blue-200 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            AssetFi UAE 🇦🇪
          </h1>
          <p className="text-xl text-blue-200">
            Tokenized Lease-to-Own Asset Finance on Stellar
          </p>
          <p className="text-lg text-blue-300 mt-2" dir="rtl" lang="ar">
            تمويل الأصول المرمز على شبكة Stellar
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

          {/* Roadmap Summary */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 mb-8 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-4 text-center">📅 Development Status</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-100">
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-white">Phase 1: Complete</p>
                <p className="text-xs mt-1">MVP portals, risk engine, authentication</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-white">Phase 2: Complete</p>
                <p className="text-xs mt-1">5 Soroban contract stubs (simulated)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-white">Phase 3: Complete</p>
                <p className="text-xs mt-1">Rule-based risk framework</p>
              </div>
            </div>
            <p className="text-center text-blue-300 text-xs mt-4">
              Next: Real Rust Soroban deployment, ML models, compliance • Mainnet requires regulatory approval
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              🎬 Launch Live Demo
            </Link>
            <Link
              href="/whitepaper"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              📄 Read Whitepaper
            </Link>
            <Link
              href="/pitch"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              📊 View Pitch Deck
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link href="/about" className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors">
              <h4 className="font-semibold text-white mb-2">ℹ️ About AssetFi</h4>
              <p className="text-sm text-blue-200">Mission, vision, and current status</p>
            </Link>
            <Link href="/documents" className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors">
              <h4 className="font-semibold text-white mb-2">📋 Required Documents</h4>
              <p className="text-sm text-blue-200">KYC checklist for SMEs & investors</p>
            </Link>
            <Link href="/pitch#timeline" className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-colors">
              <h4 className="font-semibold text-white mb-2">🗺️ Full Roadmap</h4>
              <p className="text-sm text-blue-200">Detailed phase timeline & next steps</p>
            </Link>
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
