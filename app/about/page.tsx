import Link from 'next/link';

export default function AboutPage() {
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
              <Link href="/" className="text-blue-200 hover:text-white transition-colors">
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
              <Link href="/about" className="text-white font-semibold">
                About
              </Link>
              <Link href="/login" className="text-blue-200 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50 mb-6">
              <span className="text-yellow-300 font-semibold">⚠️ Stellar Testnet Technology Prototype</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              About AssetFi UAE
            </h1>
            <p className="text-xl text-blue-200">
              Bringing transparent, blockchain-powered asset finance to UAE SMEs
            </p>
            <p className="text-lg text-blue-300 mt-2" dir="rtl" lang="ar">
              نحو تمويل أصول شفاف مدعوم بالبلوكشين للشركات الصغيرة والمتوسطة في الإمارات
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">

            {/* Mission & Vision */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🎯</span>
                    <h2 className="text-3xl font-bold text-white">Mission</h2>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    Enable UAE Small and Medium Enterprises to access productive assets through transparent, technology-powered lease-to-own financing, while providing accredited investors with opportunities to invest in real-world asset returns.
                  </p>
                  <p className="text-blue-100 leading-relaxed mt-4" dir="rtl" lang="ar">
                    تمكين الشركات الصغيرة والمتوسطة الإماراتية من الوصول إلى الأصول الإنتاجية من خلال تمويل الإيجار بالتملك الشفاف المدعوم بالتكنولوجيا، مع توفير فرص للمستثمرين المعتمدين للاستثمار في عوائد الأصول الحقيقية.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🌟</span>
                    <h2 className="text-3xl font-bold text-white">Vision</h2>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    Become the leading blockchain-powered asset finance platform in the GCC region, democratizing access to productive assets for growing businesses and creating a transparent, efficient marketplace for real-world asset investment.
                  </p>
                  <p className="text-blue-100 leading-relaxed mt-4" dir="rtl" lang="ar">
                    أن نصبح منصة تمويل الأصول الرائدة المدعومة بالبلوكشين في منطقة الخليج، مع إضفاء الطابع الديمقراطي على الوصول إلى الأصول الإنتاجية للشركات النامية وإنشاء سوق شفافة وفعالة للاستثمار في الأصول الحقيقية.
                  </p>
                </div>
              </div>
            </section>

            {/* Current Status */}
            <section className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-8 border border-green-500/30">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">📍</span>
                <h2 className="text-3xl font-bold text-white">Current Status</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">Phases 1-3: Complete ✅</h3>
                  <ul className="space-y-2 text-blue-100 text-sm">
                    <li>✓ Phase 1: Web app with 4 portals, authentication, risk engine</li>
                    <li>✓ Phase 2: 5 Soroban contract stubs (TypeScript with simulated transactions)</li>
                    <li>✓ Phase 3: Rule-based risk scoring and document management framework</li>
                    <li>✓ Database schema with demo data (Gulf Logistics scenario)</li>
                    <li>✓ Payment schedules, audit trails, comprehensive documentation</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">What This Means:</h3>
                  <ul className="space-y-2 text-blue-100 text-sm">
                    <li>🎬 <strong>Live Demo:</strong> Fully functional prototype with simulated blockchain</li>
                    <li>⚠️ <strong>Testnet Simulation:</strong> Contract stubs, no real Soroban deployment yet</li>
                    <li>🔬 <strong>Architecture Ready:</strong> Foundation for real Rust contracts & ML models</li>
                    <li>📋 <strong>Grant Application:</strong> Stellar Community Fund Build Award</li>
                    <li>🚧 <strong>Not Licensed:</strong> Requires regulatory approval for real operations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">⚙️</span>
                <h2 className="text-3xl font-bold text-white">How AssetFi Works</h2>
              </div>
              <div className="space-y-6">
                <p className="text-blue-100 leading-relaxed">
                  AssetFi UAE combines traditional asset finance with blockchain technology to create a transparent, efficient financing ecosystem:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                    <div className="text-3xl mb-3">🏢</div>
                    <h3 className="text-lg font-bold text-white mb-2">1. SME Applies</h3>
                    <p className="text-sm text-blue-100">Company submits online application for productive asset (truck, equipment), uploads documents, specifies contribution</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
                    <div className="text-3xl mb-3">🤖</div>
                    <h3 className="text-lg font-bold text-white mb-2">2. Risk Assessment</h3>
                    <p className="text-sm text-blue-100">Automated 3D engine scores Company + Asset + Deal structure, assigns tier (A/B/C/D) with corresponding terms</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
                    <div className="text-3xl mb-3">👨‍💼</div>
                    <h3 className="text-lg font-bold text-white mb-2">3. Underwriter Review</h3>
                    <p className="text-sm text-blue-100">Human underwriter reviews AI scores, verifies documents, makes final decision: approve/reject/conditional</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-6 border border-yellow-500/30">
                    <div className="text-3xl mb-3">💰</div>
                    <h3 className="text-lg font-bold text-white mb-2">4. Pool Funding</h3>
                    <p className="text-sm text-blue-100">Approved deals grouped into investment pools. Accredited investors subscribe with fractional amounts (min AED 25K)</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-orange-500/30">
                    <div className="text-3xl mb-3">⛓️</div>
                    <h3 className="text-lg font-bold text-white mb-2">5. On-Chain Registry</h3>
                    <p className="text-sm text-blue-100">Asset registered on Stellar with document hashes. Smart contracts manage facility lifecycle</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-6 border border-red-500/30">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-lg font-bold text-white mb-2">6. Payment Distribution</h3>
                    <p className="text-sm text-blue-100">SME pays monthly lease installments. Soroban contracts automatically distribute proportional returns to investors</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Technology Stack */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🛠️</span>
                <h2 className="text-3xl font-bold text-white">Technology Stack</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Frontend & Application:</h3>
                  <ul className="space-y-2 text-blue-100 text-sm">
                    <li><strong>Next.js 14:</strong> React framework with App Router</li>
                    <li><strong>TypeScript:</strong> Type-safe development</li>
                    <li><strong>Tailwind CSS + shadcn/ui:</strong> Modern UI components</li>
                    <li><strong>NextAuth.js:</strong> Authentication with role-based access</li>
                    <li><strong>Prisma ORM:</strong> Type-safe database queries</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Blockchain & Backend:</h3>
                  <ul className="space-y-2 text-blue-100 text-sm">
                    <li><strong>Stellar Testnet:</strong> Blockchain infrastructure</li>
                    <li><strong>Soroban:</strong> Smart contracts (Rust, Phase 2)</li>
                    <li><strong>PostgreSQL/SQLite:</strong> Primary database</li>
                    <li><strong>Stellar SDK:</strong> Blockchain integration</li>
                    <li><strong>AI/ML:</strong> Document processing (Phase 3)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-blue-500/20 rounded-lg p-4 border border-blue-500/50">
                <p className="text-blue-200 text-sm">
                  <strong>Open Source:</strong> AssetFi UAE leverages best-in-class open source technologies to ensure transparency, security, and community auditability.
                </p>
              </div>
            </section>

            {/* Why Stellar */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">⭐</span>
                <h2 className="text-3xl font-bold text-white">Why Stellar?</h2>
              </div>
              <div className="space-y-4 text-blue-100">
                <p className="leading-relaxed">
                  We chose Stellar as the blockchain infrastructure for AssetFi UAE because it uniquely combines the features required for institutional-grade asset finance:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="font-semibold text-white mb-2">⚡ Fast & Cheap</h4>
                    <p className="text-sm">~5 second settlement, ~$0.00001 per transaction - perfect for monthly payment distribution</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/30">
                    <h4 className="font-semibold text-white mb-2">🔒 Built for Assets</h4>
                    <p className="text-sm">Native asset issuance, multi-signature support, compliance-friendly design</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="font-semibold text-white mb-2">🛠️ Soroban Smart Contracts</h4>
                    <p className="text-sm">Rust-based contracts for automated investor distribution and pool management</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg p-4 border border-orange-500/30">
                    <h4 className="font-semibold text-white mb-2">💰 Stablecoin Ready</h4>
                    <p className="text-sm">Path to real AED stablecoin integration via licensed issuer</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
                    <h4 className="font-semibold text-white mb-2">🌐 Cross-Border</h4>
                    <p className="text-sm">Easy expansion to other GCC markets with same infrastructure</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-4 border border-red-500/30">
                    <h4 className="font-semibold text-white mb-2">📊 Transparent</h4>
                    <p className="text-sm">Investors see real-time on-chain payment flows and distributions</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Roadmap Summary */}
            <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🗺️</span>
                <h2 className="text-3xl font-bold text-white">Development Roadmap</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Phase 1: MVP Foundation (Complete)</h3>
                    <p className="text-blue-100 text-sm">Full web application with 4 portals, authentication, risk engine, demo data</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Phase 2: Soroban Contract Stubs (Complete)</h3>
                    <p className="text-blue-100 text-sm">5 contract TypeScript stubs with simulated transactions. Real Rust deployment planned.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Phase 3: AI Assist Framework (Complete)</h3>
                    <p className="text-blue-100 text-sm">Rule-based risk engine and document management. Real ML models planned.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">→</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Next: Production Enhancements (Future)</h3>
                    <p className="text-blue-100 text-sm">Real Rust Soroban deployment, ML models, regulatory compliance</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link 
                  href="/pitch"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View Full Roadmap in Pitch Deck →
                </Link>
              </div>
            </section>

            {/* Regulatory Disclaimer */}
            <section className="bg-red-500/20 rounded-2xl p-8 border border-red-500/50">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">⚖️</span>
                <h2 className="text-3xl font-bold text-white">Regulatory Status</h2>
              </div>
              <div className="space-y-4 text-red-100">
                <p className="leading-relaxed">
                  <strong>Important:</strong> AssetFi UAE is currently a technology demonstration on Stellar Testnet. It is NOT a licensed financial product and does NOT accept real applications, investments, or funds.
                </p>
                <p className="leading-relaxed" dir="rtl" lang="ar">
                  <strong>مهم:</strong> AssetFi UAE حالياً عرض تقني على Stellar Testnet. وهو ليس منتجاً مالياً مرخصاً ولا يقبل طلبات أو استثمارات أو أموال حقيقية.
                </p>
                <div className="bg-red-500/30 rounded-lg p-4 border border-red-500/50">
                  <h3 className="font-semibold text-white mb-2">Requirements for Real Operations:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Valid finance company license from CBUAE (Central Bank of UAE)</li>
                    <li>✓ Securities framework approval if investments constitute securities (ADGM/DFSA)</li>
                    <li>✓ Partnership with licensed financial institution</li>
                    <li>✓ Complete KYC/AML compliance infrastructure</li>
                    <li>✓ Third-party security and legal audits</li>
                    <li>✓ Licensed AED stablecoin issuer (for real money operations)</li>
                  </ul>
                </div>
                <p className="text-sm">
                  AssetFi will remain on Testnet for technology validation and will not deploy to Mainnet or handle real funds without satisfying all regulatory requirements.
                </p>
              </div>
            </section>

            {/* Contact & Links */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">📚</span>
                <h2 className="text-3xl font-bold text-white">Learn More</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Documentation:</h3>
                  <div className="space-y-2">
                    <Link href="/whitepaper" className="block px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors">
                      <span className="text-white font-semibold">📄 Whitepaper</span>
                      <p className="text-sm text-blue-200">Complete technical and business overview</p>
                    </Link>
                    <Link href="/pitch" className="block px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-colors">
                      <span className="text-white font-semibold">📊 Pitch Deck</span>
                      <p className="text-sm text-blue-200">Slide-by-slide presentation format</p>
                    </Link>
                    <Link href="/documents" className="block px-4 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-colors">
                      <span className="text-white font-semibold">📋 Documents</span>
                      <p className="text-sm text-blue-200">Required paperwork and KYC checklist</p>
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Project Info:</h3>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10 space-y-2 text-sm text-blue-100">
                    <p><strong className="text-white">Project:</strong> AssetFi UAE</p>
                    <p><strong className="text-white">Purpose:</strong> Stellar Community Fund Build Award Application</p>
                    <p><strong className="text-white">Status:</strong> Phase 1 Complete - Testnet Prototype</p>
                    <p><strong className="text-white">Repository:</strong> ahmed-fouad/vartola-playground</p>
                    <p><strong className="text-white">Network:</strong> Stellar Testnet</p>
                    <p><strong className="text-white">Development:</strong> Built with Cursor AI</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/login"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg text-lg transition-colors"
                >
                  Try Live Demo →
                </Link>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-white/20">
              <p className="text-blue-300">
                AssetFi UAE - Tokenized Asset Finance on Stellar
              </p>
              <p className="text-blue-400 text-sm mt-2">
                Built with ❤️ in the UAE | Powered by Stellar Testnet
              </p>
              <p className="text-blue-500 text-xs mt-2">
                ⚠️ Technology Demonstration Only - No Real Value
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
