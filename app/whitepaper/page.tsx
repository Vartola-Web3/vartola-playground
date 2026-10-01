import Link from 'next/link';

export default function WhitepaperPage() {
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
              <Link href="/whitepaper" className="text-white font-semibold">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50 mb-6">
              <span className="text-yellow-300 font-semibold">⚠️ Stellar Testnet Prototype - Technology Demonstration</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              AssetFi UAE Whitepaper
            </h1>
            <p className="text-xl text-blue-200">
              Tokenized Asset Finance for UAE SMEs on Stellar
            </p>
            <p className="text-sm text-blue-300 mt-2">
              النسخة التجريبية على شبكة Stellar Testnet - عرض تقني
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-12">
            
            {/* Executive Summary - Bilingual */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Executive Summary | الملخص التنفيذي
              </h2>
              <div className="space-y-4 text-blue-100">
                <p className="leading-relaxed">
                  <strong className="text-white">English:</strong> AssetFi UAE is an institutional fintech platform enabling UAE Small and Medium Enterprises (SMEs) to access productive assets through tokenized lease-to-own financing on the Stellar blockchain. By combining traditional asset finance with blockchain transparency and fractional investment, we unlock liquidity for underserved logistics, delivery, and transportation businesses while providing accredited investors with access to real-world asset returns.
                </p>
                <p className="leading-relaxed" dir="rtl" lang="ar">
                  <strong className="text-white">العربية:</strong> AssetFi UAE هي منصة تقنية مالية مؤسسية تمكّن الشركات الصغيرة والمتوسطة في الإمارات من الحصول على الأصول الإنتاجية من خلال التمويل المرمز على سلسلة Stellar blockchain. من خلال الجمع بين تمويل الأصول التقليدي مع شفافية البلوكشين والاستثمار الجزئي، نفتح السيولة للشركات اللوجستية والتوصيل والنقل المحرومة من الخدمات، بينما نوفر للمستثمرين المعتمدين إمكانية الوصول إلى عوائد الأصول الحقيقية.
                </p>
              </div>
            </section>

            {/* Problem Statement */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                The Problem | المشكلة
              </h2>
              <div className="space-y-4 text-blue-100">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">For SMEs:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>High upfront capital requirements prevent asset acquisition</li>
                    <li>Traditional bank financing has strict requirements and slow processes</li>
                    <li>Logistics and delivery businesses struggle to scale without vehicles</li>
                    <li>Lack of transparent, fair pricing for asset finance</li>
                  </ul>
                </div>
                <div dir="rtl" lang="ar">
                  <h3 className="text-xl font-semibold text-white mb-2">للشركات الصغيرة والمتوسطة:</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>متطلبات رأس مال أولية عالية تمنع الحصول على الأصول</li>
                    <li>التمويل المصرفي التقليدي له متطلبات صارمة وعمليات بطيئة</li>
                    <li>شركات الخدمات اللوجستية والتوصيل تواجه صعوبة في التوسع بدون مركبات</li>
                    <li>نقص التسعير الشفاف والعادل لتمويل الأصول</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">For Investors:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Limited access to real-world asset investment opportunities</li>
                    <li>High minimum investment amounts exclude retail investors</li>
                    <li>Opaque reporting and payment distribution</li>
                    <li>Lack of liquidity in traditional asset finance</li>
                  </ul>
                </div>
                <div dir="rtl" lang="ar">
                  <h3 className="text-xl font-semibold text-white mb-2">للمستثمرين:</h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>وصول محدود لفرص الاستثمار في الأصول الحقيقية</li>
                    <li>حدود استثمار دنيا مرتفعة تستبعد صغار المستثمرين</li>
                    <li>التقارير الغامضة وتوزيع المدفوعات</li>
                    <li>نقص السيولة في تمويل الأصول التقليدي</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Solution */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                The Solution | الحل
              </h2>
              <div className="space-y-6 text-blue-100">
                <p className="leading-relaxed">
                  AssetFi UAE leverages Stellar's blockchain infrastructure to create a transparent, efficient, and accessible asset finance platform:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">🏢 SME Portal</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Online application process</li>
                      <li>• Automated risk assessment</li>
                      <li>• Quick approval decisions</li>
                      <li>• Transparent payment tracking</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">💰 Investor Portal</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Browse curated asset pools</li>
                      <li>• Fractional investment (from AED 25,000)</li>
                      <li>• Real-time return tracking</li>
                      <li>• Automated monthly distributions</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">⚖️ Underwriting Engine</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• 3D risk scoring (Company, Asset, Deal)</li>
                      <li>• Automated tier assignment (A/B/C/D)</li>
                      <li>• Document verification workflow</li>
                      <li>• Human-in-the-loop approval</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">⛓️ Stellar Blockchain</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Asset registration on-chain</li>
                      <li>• Payment distribution transparency</li>
                      <li>• Smart contract automation</li>
                      <li>• Immutable audit trail</li>
                    </ul>
                  </div>
                </div>
                <p className="leading-relaxed" dir="rtl" lang="ar">
                  تستفيد AssetFi UAE من البنية التحتية لسلسلة Stellar blockchain لإنشاء منصة تمويل أصول شفافة وفعالة ويمكن الوصول إليها، تربط بين الشركات الصغيرة والمتوسطة التي تحتاج إلى أصول إنتاجية والمستثمرين الذين يبحثون عن عوائد مستقرة مدعومة بأصول حقيقية.
                </p>
              </div>
            </section>

            {/* Technology Architecture */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Technology Architecture | البنية التقنية
              </h2>
              <div className="space-y-4 text-blue-100">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">System Components:</h3>
                  <ul className="space-y-2">
                    <li><strong>Frontend:</strong> Next.js 14 + TypeScript + Tailwind CSS</li>
                    <li><strong>Database:</strong> PostgreSQL/SQLite with Prisma ORM</li>
                    <li><strong>Authentication:</strong> NextAuth.js with role-based access</li>
                    <li><strong>Risk Engine:</strong> Configurable rule-based scoring system</li>
                    <li><strong>Blockchain:</strong> Stellar Testnet with Soroban smart contracts</li>
                    <li><strong>Token:</strong> Simulated tAED (test AED - no real value)</li>
                  </ul>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">Soroban Smart Contracts:</h3>
                  <ul className="space-y-2">
                    <li><strong>1. InvestorWhitelist:</strong> Manage approved investor addresses</li>
                    <li><strong>2. AssetRegistry:</strong> Register financed assets with metadata</li>
                    <li><strong>3. FinancingFacility:</strong> Represent approved financing structures</li>
                    <li><strong>4. FinancingPool:</strong> Manage investor subscriptions and pool funding</li>
                    <li><strong>5. PaymentDistributor:</strong> Record payments and distribute to investors</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Risk Engine */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Risk Assessment Engine | محرك تقييم المخاطر
              </h2>
              <div className="space-y-4 text-blue-100">
                <p className="leading-relaxed">
                  AssetFi uses a three-dimensional risk scoring system to evaluate financing applications:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                    <h4 className="text-lg font-semibold text-white mb-2">Company Risk</h4>
                    <p className="text-sm">Business age, revenue, cash flow, debt ratio, industry, documents (0-100)</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="text-lg font-semibold text-white mb-2">Asset Risk</h4>
                    <p className="text-sm">Asset type, age, condition, market value, resale liquidity (0-100)</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="text-lg font-semibold text-white mb-2">Deal Risk</h4>
                    <p className="text-sm">Combined score determining tier A/B/C/D, LTV, term, affordability (0-100)</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10 mt-4">
                  <h3 className="text-xl font-semibold text-white mb-3">Risk Tiers:</h3>
                  <ul className="space-y-2">
                    <li><strong className="text-green-400">Tier A (81-100):</strong> Low risk - Max 80% LTV, 60 months, 6-8% rate</li>
                    <li><strong className="text-yellow-400">Tier B (66-80):</strong> Medium-low risk - Max 75% LTV, 48 months, 8-10% rate</li>
                    <li><strong className="text-orange-400">Tier C (51-65):</strong> Medium-high risk - Max 70% LTV, 36 months, 10-12% rate</li>
                    <li><strong className="text-red-400">Tier D (0-50):</strong> High risk - Max 60% LTV, 24 months, 12-15% rate</li>
                  </ul>
                </div>
                <p className="leading-relaxed" dir="rtl" lang="ar">
                  يستخدم AssetFi نظام تسجيل مخاطر ثلاثي الأبعاد لتقييم طلبات التمويل، يجمع بين مخاطر الشركة ومخاطر الأصل ومخاطر الصفقة لتحديد الشريحة المناسبة (A/B/C/D) وشروط التمويل المقابلة.
                </p>
              </div>
            </section>

            {/* TIMELINE & ROADMAP - Key Section */}
            <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/20 pb-2">
                📅 Development Timeline & Roadmap | الجدول الزمني وخارطة الطريق
              </h2>
              <div className="mb-4 bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/50">
                <p className="text-yellow-200 text-sm leading-relaxed">
                  <strong>⚠️ Important:</strong> This is a Stellar Testnet prototype roadmap for grant demonstration purposes. All phases occur on Testnet with no real value. Mainnet deployment requires regulatory licensing and compliance approval.
                </p>
                <p className="text-yellow-200 text-sm leading-relaxed mt-2" dir="rtl" lang="ar">
                  <strong>⚠️ مهم:</strong> هذه خارطة طريق نموذج أولي على Stellar Testnet لأغراض توضيح المنحة. جميع المراحل تحدث على Testnet بدون قيمة حقيقية. يتطلب النشر على Mainnet ترخيصاً تنظيمياً وموافقة الامتثال.
                </p>
              </div>

              <div className="space-y-6">
                {/* Phase 1 */}
                <div className="relative pl-8 border-l-4 border-green-500">
                  <div className="absolute -left-3 top-0 w-5 h-5 bg-green-500 rounded-full"></div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white">Phase 1: MVP Foundation</h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">✅ COMPLETE</span>
                    </div>
                    <p className="text-blue-200 mb-4"><strong>Status:</strong> Completed - Full working prototype on Testnet</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-100">
                      <div>
                        <h4 className="font-semibold text-white mb-2">✅ Delivered:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Complete database schema with Prisma ORM</li>
                          <li>4 role-based portals (SME, Investor, Underwriter, Admin)</li>
                          <li>NextAuth.js authentication system</li>
                          <li>3D risk assessment engine with tier assignment</li>
                          <li>Seeded demo data (Gulf Logistics scenario)</li>
                          <li>Stellar integration stubs and transaction mocks</li>
                          <li>Complete architecture documentation</li>
                          <li>Working Next.js 14 application</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">🎯 Outcomes:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Functional web application demo</li>
                          <li>End-to-end financing workflow</li>
                          <li>Risk scoring demonstration</li>
                          <li>UI/UX validation with stakeholders</li>
                          <li>Technical feasibility confirmed</li>
                          <li>Foundation for Soroban integration</li>
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-blue-200" dir="rtl" lang="ar">
                      المرحلة الأولى مكتملة: تطبيق ويب عامل بالكامل مع بوابات جميع الأدوار، محرك تقييم المخاطر، ونماذج Stellar جاهزة للتكامل.
                    </p>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative pl-8 border-l-4 border-green-500">
                  <div className="absolute -left-3 top-0 w-5 h-5 bg-green-500 rounded-full"></div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white">Phase 2: Soroban Contract Stubs</h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">✅ COMPLETE</span>
                    </div>
                    <p className="text-blue-200 mb-4"><strong>Delivered:</strong> 5 Soroban smart contract stubs with simulated transactions</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-100">
                      <div>
                        <h4 className="font-semibold text-white mb-2">✅ Delivered:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>5 Soroban contract TypeScript stubs:
                            <ul className="ml-6 mt-1 space-y-1">
                              <li>- InvestorWhitelist</li>
                              <li>- AssetRegistry</li>
                              <li>- FinancingFacility</li>
                              <li>- FinancingPool</li>
                              <li>- PaymentDistributor</li>
                            </ul>
                          </li>
                          <li>Simulated transaction generation</li>
                          <li>Transaction delays for realism</li>
                          <li>Contract interface definitions</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">📝 Note:</h4>
                        <p className="text-sm">
                          Contract stubs demonstrate Soroban integration architecture with simulated blockchain interactions. Real Rust contract deployment to Stellar Testnet planned for future enhancement.
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-blue-200" dir="rtl" lang="ar">
                      المرحلة الثانية مكتملة: 5 عقود Soroban كنماذج TypeScript مع معاملات محاكاة. نشر Rust الحقيقي مخطط للمستقبل.
                    </p>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative pl-8 border-l-4 border-green-500">
                  <div className="absolute -left-3 top-0 w-5 h-5 bg-green-500 rounded-full"></div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white">Phase 3: AI Assist Framework</h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">✅ COMPLETE</span>
                    </div>
                    <p className="text-blue-200 mb-4"><strong>Delivered:</strong> Rule-based risk engine and document management framework</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-100">
                      <div>
                        <h4 className="font-semibold text-white mb-2">✅ Delivered:</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>3D risk scoring algorithm (Company/Asset/Deal)</li>
                          <li>Automated tier assignment (A/B/C/D)</li>
                          <li>Document upload & SHA-256 hash generation</li>
                          <li>Human-in-the-loop approval workflow</li>
                          <li>Complete audit trail logging</li>
                          <li>Configurable risk parameters</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">📝 Note:</h4>
                        <p className="text-sm">
                          Current implementation uses rule-based scoring algorithms. Real ML models (OCR, fraud detection, predictive analytics) and trained models on UAE SME data planned for future enhancement.
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-blue-200" dir="rtl" lang="ar">
                      المرحلة الثالثة مكتملة: محرك تقييم مخاطر قائم على القواعد مع سير عمل موافقة بشرية. نماذج ML الحقيقية مخططة للمستقبل.
                    </p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="relative pl-8 border-l-4 border-orange-500">
                  <div className="absolute -left-3 top-0 w-5 h-5 bg-orange-500 rounded-full"></div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white">Next: Production Enhancements</h3>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-semibold">🎯 FUTURE</span>
                    </div>
                    <div className="space-y-4 text-blue-100">
                      <div>
                        <h4 className="font-semibold text-white mb-2">⛓️ Real Blockchain Deployment:</h4>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                          <li>Write Rust Soroban smart contracts</li>
                          <li>Deploy contracts to Stellar Testnet</li>
                          <li>Generate TypeScript SDK from deployed contracts</li>
                          <li>Replace simulation stubs with live transactions</li>
                          <li>Real tAED test token integration</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">🤖 Real Machine Learning:</h4>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                          <li>OCR pipeline for Arabic/English documents</li>
                          <li>Train ML risk models on UAE SME data</li>
                          <li>Fraud detection and anomaly detection</li>
                          <li>Predictive default probability models</li>
                          <li>Explainable AI framework</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">⚖️ Compliance & Regulatory:</h4>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                          <li>Legal review of tokenized asset finance structure</li>
                          <li>Engage with CBUAE on finance company licensing</li>
                          <li>Consult ADGM/DFSA on tokenized securities</li>
                          <li>Develop KYC/AML procedures for investors</li>
                          <li>Draft investor qualification criteria</li>
                          <li>Establish data privacy compliance (UAE DPA)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">🚀 Mainnet Path (Long-term):</h4>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                          <li><strong>Requires:</strong> Regulatory approval, licensed partner, full legal framework</li>
                          <li>Mainnet deployment only after successful Testnet validation</li>
                          <li>Real AED stablecoin integration (licensed issuer required)</li>
                          <li>Production-grade security audits</li>
                          <li>Insurance and risk management frameworks</li>
                          <li>Customer support and operations infrastructure</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 bg-red-500/20 rounded-lg p-4 border border-red-500/50">
                      <p className="text-red-200 text-sm font-semibold">
                        ⚠️ Mainnet Launch Disclaimer: AssetFi UAE will NOT launch on Stellar Mainnet or handle real funds without:
                      </p>
                      <ul className="text-red-200 text-sm mt-2 space-y-1 list-disc list-inside ml-4">
                        <li>Valid finance company license from CBUAE</li>
                        <li>Securities/investment framework approval (if applicable)</li>
                        <li>Partnership with licensed financial institution</li>
                        <li>Complete legal and compliance infrastructure</li>
                        <li>Third-party security and legal audits</li>
                      </ul>
                    </div>
                    <p className="mt-4 text-sm text-blue-200" dir="rtl" lang="ar">
                      الخطوات القادمة: تطوير عقود Soroban، تكامل ML الحقيقي، والامتثال التنظيمي. إطلاق Mainnet يتطلب تراخيص كاملة وشريك مرخص ومراجعات قانونية.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                <p className="text-blue-200 text-sm">
                  <strong>📊 Current Status:</strong> Phases 1-3 complete on Testnet. All portals operational, 5 Soroban contract stubs working with simulated transactions, rule-based risk engine deployed. Next: Real Rust Soroban deployment to Testnet, ML models, and regulatory compliance.
                </p>
              </div>
            </section>

            {/* Market Opportunity */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Market Opportunity | فرصة السوق
              </h2>
              <div className="space-y-4 text-blue-100">
                <p className="leading-relaxed">
                  The UAE SME sector represents a significant opportunity for tokenized asset finance:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-2xl font-bold text-white mb-2">560,000+</h4>
                    <p className="text-sm">SMEs in UAE (94% of businesses)</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-2xl font-bold text-white mb-2">Logistics</h4>
                    <p className="text-sm">Fast-growing sector with high vehicle financing needs</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-2xl font-bold text-white mb-2">Alternative</h4>
                    <p className="text-sm">Asset finance fills gap between bank loans and leasing</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Target Market - Phase 1 Focus:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Logistics & Transportation:</strong> Delivery companies needing trucks and vans</li>
                    <li><strong>E-commerce:</strong> Last-mile delivery vehicle financing</li>
                    <li><strong>Asset Type:</strong> Commercial vehicles (AED 100K - 500K range)</li>
                    <li><strong>Geography:</strong> Dubai, Abu Dhabi, and Northern Emirates</li>
                  </ul>
                </div>
                <p className="text-sm italic text-blue-300">
                  Note: Market sizing is for contextual understanding of the UAE SME landscape. AssetFi UAE is currently a Testnet prototype and does not claim existing market partnerships or customer commitments.
                </p>
              </div>
            </section>

            {/* Business Model */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Business Model | نموذج الأعمال
              </h2>
              <div className="space-y-4 text-blue-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">Revenue Streams (Proposed):</h3>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Interest Margin:</strong> Spread between SME rate and investor return (1-3%)</li>
                      <li><strong>Origination Fee:</strong> 1-2% of finance amount (SME pays)</li>
                      <li><strong>Platform Fee:</strong> 0.5-1% annual on invested capital (investors)</li>
                      <li><strong>Underwriting Fee:</strong> For complex deals requiring manual review</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">Cost Structure:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>Technology development and maintenance</li>
                      <li>Stellar transaction fees (minimal)</li>
                      <li>Underwriting and credit assessment</li>
                      <li>KYC/AML compliance</li>
                      <li>Customer support</li>
                      <li>Regulatory and legal</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm italic text-blue-300">
                  Note: Business model is conceptual for prototype demonstration. Real revenue operations require regulatory approval and licensed entity.
                </p>
              </div>
            </section>

            {/* Privacy & Compliance */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Privacy & Compliance | الخصوصية والامتثال
              </h2>
              <div className="space-y-4 text-blue-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">✅ On-Chain (Public):</h3>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Asset type (e.g., "TRUCK")</li>
                      <li>Asset value (numeric)</li>
                      <li>Finance amounts</li>
                      <li>Payment dates and amounts</li>
                      <li>Document hashes (SHA-256)</li>
                      <li>Pseudonymous addresses</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">❌ Off-Chain Only (Private):</h3>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Company names</li>
                      <li>Trade license numbers</li>
                      <li>Emirates ID details</li>
                      <li>Bank account information</li>
                      <li>Contact information</li>
                      <li>Raw documents</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/50 mt-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>Privacy Rule:</strong> If it contains Personally Identifiable Information (PII), it NEVER goes on-chain. Only hashes and pseudonymous references are stored on Stellar.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 mt-6">Regulatory Considerations:</h3>
                  <ul className="space-y-2 text-sm list-disc list-inside">
                    <li><strong>CBUAE:</strong> Finance company licensing required for real operations</li>
                    <li><strong>ADGM/DFSA:</strong> May apply if tokenized investments are securities</li>
                    <li><strong>KYC/AML:</strong> Full customer verification for all participants</li>
                    <li><strong>Data Privacy:</strong> UAE Data Protection Law compliance</li>
                    <li><strong>Investor Protection:</strong> Disclosures, qualifications, suitability</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Team & Contact */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-4 border-b border-white/20 pb-2">
                Team & Contact | الفريق والتواصل
              </h2>
              <div className="space-y-4 text-blue-100">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Project Information:</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Project:</strong> AssetFi UAE</li>
                    <li><strong>Purpose:</strong> Stellar Community Fund Build Award Application</li>
                    <li><strong>Status:</strong> Phase 1 Complete - Testnet Prototype</li>
                    <li><strong>Development:</strong> Built with Cursor AI assistance</li>
                    <li><strong>Repository:</strong> ahmed-fouad/vartola-playground</li>
                  </ul>
                </div>
                <p className="text-sm text-blue-300">
                  This whitepaper describes a technology demonstration on Stellar Testnet. AssetFi UAE is not a licensed financial product and does not accept real investments or handle real money.
                </p>
                <p className="text-sm text-blue-300" dir="rtl" lang="ar">
                  تصف هذه الورقة البيضاء عرضاً تقنياً على Stellar Testnet. AssetFi UAE ليس منتجاً مالياً مرخصاً ولا يقبل استثمارات حقيقية أو يتعامل مع أموال حقيقية.
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-white/20">
              <p className="text-blue-300 text-sm">
                AssetFi UAE Whitepaper v1.0 | October 2026
              </p>
              <p className="text-blue-400 text-xs mt-2">
                ⚠️ Stellar Testnet Prototype - Technology Demonstration Only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
