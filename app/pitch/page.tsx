import Link from 'next/link';

export default function PitchPage() {
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
              <Link href="/pitch" className="text-white font-semibold">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Slide 1: Title */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-12 border border-white/20 text-center">
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50 mb-6">
              <span className="text-yellow-300 font-semibold text-sm">⚠️ Stellar Testnet Prototype</span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6">
              AssetFi UAE 🇦🇪
            </h1>
            <p className="text-3xl text-blue-100 mb-4">
              Tokenized Asset Finance for UAE SMEs
            </p>
            <p className="text-xl text-blue-200" dir="rtl" lang="ar">
              تمويل الأصول المرمز للشركات الصغيرة والمتوسطة الإماراتية
            </p>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-blue-200">
                Stellar Community Fund Build Award Application
              </p>
              <p className="text-blue-300 text-sm mt-2">
                October 2026 | Phase 1 MVP Complete
              </p>
            </div>
          </div>

          {/* Slide 2: The Problem */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⚠️</span>
              <h2 className="text-4xl font-bold text-white">The Problem</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-blue-300">For SMEs:</h3>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-xl flex-shrink-0">❌</span>
                    <span><strong>High Capital Barriers:</strong> Can't afford upfront costs for productive assets (trucks, equipment)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-xl flex-shrink-0">❌</span>
                    <span><strong>Slow Bank Financing:</strong> Strict requirements, lengthy approval processes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-xl flex-shrink-0">❌</span>
                    <span><strong>Growth Bottleneck:</strong> Logistics businesses can't scale without vehicles</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-purple-300">For Investors:</h3>
                <ul className="space-y-3 text-blue-100">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-xl flex-shrink-0">❌</span>
                    <span><strong>Limited Access:</strong> Real-world asset investments unavailable to most</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-xl flex-shrink-0">❌</span>
                    <span><strong>High Minimums:</strong> Traditional asset finance excludes smaller investors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-xl flex-shrink-0">❌</span>
                    <span><strong>Opacity:</strong> Unclear reporting and payment tracking</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-center text-xl text-blue-200 mt-8 font-semibold" dir="rtl" lang="ar">
              الشركات الصغيرة تحتاج الأصول، والمستثمرون يبحثون عن العوائد - لكن لا يوجد جسر شفاف بينهم
            </p>
          </div>

          {/* Slide 3: The Solution */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">💡</span>
              <h2 className="text-4xl font-bold text-white">The Solution</h2>
            </div>
            <p className="text-xl text-blue-100 mb-6">
              A transparent, blockchain-powered platform connecting SMEs who need assets with investors seeking real-world returns
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="text-lg font-bold text-white mb-2">SME Portal</h3>
                <p className="text-sm text-blue-100">Apply online, get fast approval, track payments transparently</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-lg font-bold text-white mb-2">Investor Portal</h3>
                <p className="text-sm text-blue-100">Browse pools, invest fractionally, receive automated returns</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-lg font-bold text-white mb-2">Risk Engine</h3>
                <p className="text-sm text-blue-100">3D scoring (Company, Asset, Deal) with tier-based pricing</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-orange-500/30">
                <div className="text-3xl mb-3">⛓️</div>
                <h3 className="text-lg font-bold text-white mb-2">Stellar Blockchain</h3>
                <p className="text-sm text-blue-100">Asset registry, payment distribution, immutable audit trail</p>
              </div>
            </div>
          </div>

          {/* Slide 4: How It Works */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🔄</span>
              <h2 className="text-4xl font-bold text-white">How It Works</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">SME Applies</h3>
                  <p className="text-blue-100 text-sm">Company submits application for asset (e.g., truck), uploads documents, specifies contribution amount</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Risk Assessment</h3>
                  <p className="text-blue-100 text-sm">Automated engine calculates Company Risk + Asset Risk → Deal Risk Score → Tier (A/B/C/D)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Underwriter Review</h3>
                  <p className="text-blue-100 text-sm">Human underwriter reviews risk scores, documents, and decides: Approve, Conditional Approval, or Reject</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Pool Creation & Funding</h3>
                  <p className="text-blue-100 text-sm">Approved deals go into investment pools. Accredited investors subscribe with fractional amounts (min AED 25K)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Asset Delivery & Registration</h3>
                  <p className="text-blue-100 text-sm">Once funded, asset is purchased and delivered to SME. Registered on Stellar with document hashes</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">6</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Monthly Payments & Distribution</h3>
                  <p className="text-blue-100 text-sm">SME makes monthly lease payments. Soroban smart contracts automatically distribute proportional returns to investors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: Risk Engine */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎯</span>
              <h2 className="text-4xl font-bold text-white">3D Risk Engine</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">
              Transparent, rule-based scoring system (Phase 3: AI-enhanced)
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                <h3 className="text-2xl font-bold text-white mb-2">Company Risk</h3>
                <div className="text-4xl mb-3">🏢</div>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Business age</li>
                  <li>• Monthly revenue</li>
                  <li>• Cash flow</li>
                  <li>• Debt ratio</li>
                  <li>• Industry risk</li>
                  <li>• Document completeness</li>
                </ul>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-2xl font-bold text-white mb-2">Asset Risk</h3>
                <div className="text-4xl mb-3">🚚</div>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Asset type</li>
                  <li>• Asset age (new vs used)</li>
                  <li>• Market value</li>
                  <li>• Asset condition</li>
                  <li>• Resale liquidity</li>
                </ul>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-2">Deal Risk</h3>
                <div className="text-4xl mb-3">📊</div>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Company score (40%)</li>
                  <li>• Asset score (30%)</li>
                  <li>• Finance-to-value ratio</li>
                  <li>• Term length</li>
                  <li>• Payment affordability</li>
                </ul>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Risk Tiers & Deal Parameters:</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="bg-green-500/20 rounded p-3 border border-green-500/40">
                  <div className="font-bold text-green-300 mb-1">Tier A (81-100)</div>
                  <div className="text-blue-100 space-y-1">
                    <div>Max 80% LTV</div>
                    <div>60 mo. term</div>
                    <div>6-8% rate</div>
                  </div>
                </div>
                <div className="bg-yellow-500/20 rounded p-3 border border-yellow-500/40">
                  <div className="font-bold text-yellow-300 mb-1">Tier B (66-80)</div>
                  <div className="text-blue-100 space-y-1">
                    <div>Max 75% LTV</div>
                    <div>48 mo. term</div>
                    <div>8-10% rate</div>
                  </div>
                </div>
                <div className="bg-orange-500/20 rounded p-3 border border-orange-500/40">
                  <div className="font-bold text-orange-300 mb-1">Tier C (51-65)</div>
                  <div className="text-blue-100 space-y-1">
                    <div>Max 70% LTV</div>
                    <div>36 mo. term</div>
                    <div>10-12% rate</div>
                  </div>
                </div>
                <div className="bg-red-500/20 rounded p-3 border border-red-500/40">
                  <div className="font-bold text-red-300 mb-1">Tier D (0-50)</div>
                  <div className="text-blue-100 space-y-1">
                    <div>Max 60% LTV</div>
                    <div>24 mo. term</div>
                    <div>12-15% rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 6: Demo Scenario */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎬</span>
              <h2 className="text-4xl font-bold text-white">Live Demo Scenario</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-white mb-3">🏢 Gulf Logistics LLC</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li><strong>Industry:</strong> Logistics & Transportation</li>
                    <li><strong>Established:</strong> 2021 (3 years)</li>
                    <li><strong>Monthly Revenue:</strong> AED 180,000</li>
                    <li><strong>Cash Flow:</strong> AED 40,000/month</li>
                    <li><strong>Need:</strong> Expand delivery fleet</li>
                  </ul>
                </div>
                <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-white mb-3">🚚 Asset: Isuzu NPR Truck</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li><strong>Type:</strong> Commercial Truck (New)</li>
                    <li><strong>Model:</strong> Isuzu NPR 75P 16FT Box Truck</li>
                    <li><strong>Value:</strong> AED 300,000</li>
                    <li><strong>Use:</strong> Last-mile delivery operations</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-semibold text-white mb-3">💰 Deal Structure</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li><strong>Asset Value:</strong> AED 300,000</li>
                    <li><strong>SME Contribution:</strong> AED 75,000 (25%)</li>
                    <li><strong>Finance Amount:</strong> AED 225,000 (75%)</li>
                    <li><strong>Term:</strong> 36 months</li>
                    <li><strong>Monthly Payment:</strong> ~AED 7,020</li>
                  </ul>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
                  <h3 className="text-xl font-semibold text-white mb-3">📊 Risk Assessment</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li><strong>Company Risk:</strong> 72/100 (Good)</li>
                    <li><strong>Asset Risk:</strong> 84/100 (Excellent)</li>
                    <li><strong>Deal Risk:</strong> 75/100 (Good)</li>
                    <li><strong>Tier:</strong> <span className="text-yellow-300 font-bold">B</span> (Senior UW approval)</li>
                    <li><strong>Pool:</strong> Logistics Pool 001 (AED 500K target)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-green-500/20 rounded-lg p-4 border border-green-500/50 text-center">
              <p className="text-green-200 font-semibold">
                ✅ Application Approved | 3 Investors Funded | Facility Active | 1 Payment Made
              </p>
            </div>
          </div>

          {/* Slide 7: TIMELINE & ROADMAP - KEY SLIDE */}
          <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📅</span>
              <h2 className="text-4xl font-bold text-white">Product Roadmap</h2>
            </div>
            <div className="mb-6 bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/50">
              <p className="text-yellow-200 text-sm font-semibold text-center">
                ⚠️ Stellar Testnet Grant Roadmap - Technology Prototype Only - Not Live GTM Timeline
              </p>
            </div>
            <div className="space-y-6">
              {/* Phase 1 - Complete */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-green-300">1</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-white">Phase 1: MVP Foundation</h3>
                      <span className="px-4 py-2 bg-green-500/30 text-green-200 rounded-full text-sm font-bold border border-green-400">✅ COMPLETE</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <p className="text-blue-200 mb-4"><strong>Delivered:</strong> Full working prototype on Stellar Testnet</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <ul className="space-y-1 text-blue-100">
                          <li>✅ Database schema with Prisma ORM</li>
                          <li>✅ 4 role-based portals (SME, Investor, UW, Admin)</li>
                          <li>✅ NextAuth.js authentication</li>
                          <li>✅ 3D risk engine with tier assignment</li>
                        </ul>
                        <ul className="space-y-1 text-blue-100">
                          <li>✅ Stellar integration stubs</li>
                          <li>✅ Demo data & scenarios</li>
                          <li>✅ Architecture docs</li>
                          <li>✅ Next.js 14 production build</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-blue-500"></div>
              </div>

              {/* Phase 2 - Complete */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-green-300">2</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-white">Phase 2: Soroban Contract Stubs</h3>
                      <span className="px-4 py-2 bg-green-500/30 text-green-200 rounded-full text-sm font-bold border border-green-400">✅ COMPLETE</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <p className="text-blue-200 mb-4"><strong>Delivered:</strong> 5 Soroban smart contract stubs with simulated transactions</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <ul className="space-y-1 text-blue-100">
                          <li>✅ InvestorWhitelist stub</li>
                          <li>✅ AssetRegistry stub</li>
                          <li>✅ FinancingFacility stub</li>
                          <li>✅ FinancingPool stub</li>
                        </ul>
                        <ul className="space-y-1 text-blue-100">
                          <li>✅ PaymentDistributor stub</li>
                          <li>✅ Simulated tx hashes</li>
                          <li>✅ Contract interfaces</li>
                          <li>✅ Integration architecture</li>
                        </ul>
                      </div>
                      <p className="mt-4 text-xs text-blue-300 italic">
                        Note: TypeScript stubs demonstrate Soroban architecture. Real Rust deployment planned.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-500"></div>
              </div>

              {/* Phase 3 - Complete */}
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-green-300">3</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-white">Phase 3: AI Assist Framework</h3>
                      <span className="px-4 py-2 bg-green-500/30 text-green-200 rounded-full text-sm font-bold border border-green-400">✅ COMPLETE</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <p className="text-blue-200 mb-4"><strong>Delivered:</strong> Rule-based risk engine and document management framework</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <ul className="space-y-1 text-blue-100">
                          <li>✅ 3D risk scoring (Company/Asset/Deal)</li>
                          <li>✅ Automated tier assignment</li>
                          <li>✅ Document hash generation</li>
                          <li>✅ Human-in-the-loop workflow</li>
                        </ul>
                        <ul className="space-y-1 text-blue-100">
                          <li>✅ Audit trail logging</li>
                          <li>✅ Configurable parameters</li>
                          <li>✅ Foundation for ML</li>
                          <li>✅ Demo risk calculations</li>
                        </ul>
                      </div>
                      <p className="mt-4 text-xs text-blue-300 italic">
                        Note: Rule-based engine implemented. Real ML models planned for future.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-orange-500"></div>
              </div>

              {/* Next Steps */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-orange-300">→</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">Next: Production Enhancements</h3>
                    <span className="px-4 py-2 bg-orange-500/30 text-orange-200 rounded-full text-sm font-bold border border-orange-400">🎯 FUTURE</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <h4 className="font-semibold text-white mb-2">⛓️ Real Blockchain:</h4>
                        <ul className="space-y-1 text-blue-100">
                          <li>• Write Rust Soroban contracts</li>
                          <li>• Deploy to Stellar Testnet</li>
                          <li>• Real tAED transactions</li>
                          <li>• Replace simulation stubs</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">🤖 Real ML:</h4>
                        <ul className="space-y-1 text-blue-100">
                          <li>• OCR for Arabic/English</li>
                          <li>• ML risk scoring models</li>
                          <li>• Fraud detection signals</li>
                          <li>• Predictive analytics</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">⚖️ Compliance:</h4>
                        <ul className="space-y-1 text-blue-100">
                          <li>• CBUAE license application</li>
                          <li>• ADGM/DFSA consultation</li>
                          <li>• KYC/AML implementation</li>
                          <li>• Legal framework</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mainnet Disclaimer */}
            <div className="mt-6 bg-red-500/20 rounded-lg p-6 border border-red-500/50">
              <h4 className="text-lg font-bold text-red-200 mb-3">⚠️ Mainnet Launch Path:</h4>
              <p className="text-red-200 text-sm mb-3">
                Deployment to Stellar Mainnet with real money requires:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-red-100">
                <ul className="space-y-1">
                  <li>✓ Valid CBUAE finance company license</li>
                  <li>✓ Securities framework approval (if applicable)</li>
                  <li>✓ Licensed financial institution partnership</li>
                </ul>
                <ul className="space-y-1">
                  <li>✓ Complete legal/compliance infrastructure</li>
                  <li>✓ Third-party security audits</li>
                  <li>✓ Real AED stablecoin (licensed issuer)</li>
                </ul>
              </div>
              <p className="text-red-200 text-xs mt-3 font-semibold">
                AssetFi UAE will remain on Testnet until all regulatory requirements are satisfied.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-blue-300 text-sm" dir="rtl" lang="ar">
                خارطة الطريق: المرحلة 1 مكتملة، المرحلة 2 (Soroban) قيد التخطيط، المرحلة 3 (AI) مستقبلية، Mainnet يتطلب ترخيصاً كاملاً
              </p>
            </div>
          </div>

          {/* Slide 8: Market Opportunity */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📈</span>
              <h2 className="text-4xl font-bold text-white">Market Opportunity</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30 text-center">
                <div className="text-5xl font-bold text-white mb-2">560K+</div>
                <div className="text-blue-200">UAE SMEs</div>
                <div className="text-sm text-blue-300 mt-2">(94% of businesses)</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30 text-center">
                <div className="text-5xl font-bold text-white mb-2">Fast</div>
                <div className="text-blue-200">Growing Logistics</div>
                <div className="text-sm text-blue-300 mt-2">E-commerce boom drives vehicle demand</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30 text-center">
                <div className="text-5xl font-bold text-white mb-2">Gap</div>
                <div className="text-blue-200">Underserved Finance</div>
                <div className="text-sm text-blue-300 mt-2">Between banks and leasing</div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Phase 1 Target Market:</h3>
              <ul className="space-y-2 text-blue-100">
                <li><strong>Vertical:</strong> Logistics & Transportation SMEs</li>
                <li><strong>Asset Focus:</strong> Commercial trucks and delivery vans (AED 100K-500K)</li>
                <li><strong>Geography:</strong> Dubai, Abu Dhabi, Northern Emirates</li>
                <li><strong>Customer Profile:</strong> 2-5 year old businesses, AED 100K-300K monthly revenue</li>
              </ul>
            </div>
            <p className="text-sm text-blue-300 mt-4 italic">
              Note: Market context for understanding UAE SME landscape. No current customer partnerships or commitments.
            </p>
          </div>

          {/* Slide 9: Stellar Advantage */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⭐</span>
              <h2 className="text-4xl font-bold text-white">Why Stellar?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Fast & Low-Cost</h3>
                    <p className="text-blue-100 text-sm">5-second settlement, ~$0.00001 per transaction - perfect for monthly payments</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🔒</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Built for Assets</h3>
                    <p className="text-blue-100 text-sm">Native asset issuance, multi-signature, and compliance-friendly design</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💰</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Stablecoin Ready</h3>
                    <p className="text-blue-100 text-sm">Path for real AED stablecoin integration (via licensed issuer)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🛠️</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Soroban Smart Contracts</h3>
                    <p className="text-blue-100 text-sm">Rust-based contracts for automated payment distribution and pool management</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🌐</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Cross-Border Capable</h3>
                    <p className="text-blue-100 text-sm">Future: Expand to other GCC markets with same infrastructure</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📊</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Transparent Reporting</h3>
                    <p className="text-blue-100 text-sm">Investors see real-time on-chain payment flow and distributions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 10: Business Model */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">💵</span>
              <h2 className="text-4xl font-bold text-white">Business Model (Proposed)</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">Revenue Streams:</h3>
                <ul className="space-y-3 text-sm text-blue-100">
                  <li>
                    <strong className="text-white">Interest Margin:</strong><br/>
                    1-3% spread between SME rate and investor return
                  </li>
                  <li>
                    <strong className="text-white">Origination Fee:</strong><br/>
                    1-2% of finance amount (SME pays at closing)
                  </li>
                  <li>
                    <strong className="text-white">Platform Fee:</strong><br/>
                    0.5-1% annual on invested capital (investors)
                  </li>
                  <li>
                    <strong className="text-white">Underwriting Fee:</strong><br/>
                    For complex deals requiring manual analysis
                  </li>
                </ul>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-xl font-semibold text-white mb-4">Unit Economics Example:</h3>
                <div className="space-y-2 text-sm text-blue-100">
                  <div className="flex justify-between">
                    <span>Finance Amount:</span>
                    <span className="font-semibold text-white">AED 225,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SME Rate (Tier B):</span>
                    <span className="font-semibold text-white">9.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investor Return:</span>
                    <span className="font-semibold text-white">7.5%</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                    <span>Interest Margin:</span>
                    <span className="font-semibold text-green-300">1.5% (AED ~3,400/yr)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Origination Fee:</span>
                    <span className="font-semibold text-green-300">1.5% (AED ~3,375)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span className="font-semibold text-green-300">0.75% (AED ~1,700/yr)</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2 mt-2 font-bold">
                    <span className="text-white">Total Revenue (Year 1):</span>
                    <span className="text-green-300">~AED 8,475</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-300 mt-4 italic text-center">
              Note: Proposed business model for prototype demonstration. Real operations require licensing and regulatory approval.
            </p>
          </div>

          {/* Slide 11: Privacy & Compliance */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🔒</span>
              <h2 className="text-4xl font-bold text-white">Privacy & Compliance</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                <h3 className="text-lg font-semibold text-white mb-3">✅ On-Chain (Public):</h3>
                <ul className="space-y-1 text-sm text-blue-100 list-disc list-inside">
                  <li>Asset type (e.g., "TRUCK")</li>
                  <li>Asset value (numeric)</li>
                  <li>Finance amounts</li>
                  <li>Payment dates & amounts</li>
                  <li>Document hashes (SHA-256)</li>
                  <li>Pseudonymous addresses</li>
                </ul>
              </div>
              <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/30">
                <h3 className="text-lg font-semibold text-white mb-3">❌ Off-Chain Only:</h3>
                <ul className="space-y-1 text-sm text-blue-100 list-disc list-inside">
                  <li>Company names</li>
                  <li>Trade licenses</li>
                  <li>Emirates ID</li>
                  <li>Bank accounts</li>
                  <li>Contact info</li>
                  <li>Raw documents</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/50 mb-6">
              <p className="text-yellow-200 text-sm font-semibold text-center">
                🔒 Privacy Rule: If it's PII, it NEVER goes on-chain. Only hashes and pseudonymous data.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Regulatory Path (Required for Mainnet):</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><strong>CBUAE:</strong> Central Bank finance company license</li>
                <li><strong>ADGM/DFSA:</strong> If tokenized positions are securities</li>
                <li><strong>KYC/AML:</strong> Full identity verification for all users</li>
                <li><strong>Data Privacy:</strong> UAE Data Protection Law compliance</li>
                <li><strong>Investor Protection:</strong> Accreditation, disclosures, suitability</li>
              </ul>
            </div>
          </div>

          {/* Slide 12: Ask / Call to Action */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl p-12 border border-white/20 text-center">
            <div className="mb-6">
              <span className="text-6xl">🚀</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              Stellar Community Fund<br/>Build Award Application
            </h2>
            <div className="max-w-2xl mx-auto space-y-6 text-blue-100">
              <p className="text-xl leading-relaxed">
                AssetFi UAE demonstrates how Stellar and Soroban can power transparent, efficient asset finance for underserved SMEs in emerging markets.
              </p>
              <div className="bg-white/10 rounded-lg p-6 border border-white/20 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-white mb-4">Phase 1 Achievements:</h3>
                <ul className="space-y-2 text-left">
                  <li>✅ Complete working web application</li>
                  <li>✅ 4 role-based portals operational</li>
                  <li>✅ 3D risk engine validated with demo data</li>
                  <li>✅ Stellar integration architecture ready</li>
                  <li>✅ Comprehensive documentation</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-6 border border-white/20 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-white mb-4">Next: Phase 2 Soroban</h3>
                <p className="text-lg">
                  Deploy real smart contracts to Stellar Testnet and demonstrate end-to-end tokenized asset lifecycle with automated payment distribution.
                </p>
              </div>
              <div className="pt-6">
                <Link 
                  href="/login"
                  className="inline-block px-8 py-4 bg-white text-purple-700 font-bold rounded-lg text-lg hover:bg-blue-100 transition-colors"
                >
                  Try Live Demo →
                </Link>
              </div>
            </div>
            <p className="text-blue-200 mt-8 text-sm">
              Built with ❤️ in the UAE | Powered by Stellar Testnet
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
