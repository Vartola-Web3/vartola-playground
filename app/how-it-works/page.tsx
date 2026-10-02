import Link from 'next/link';

export default function HowItWorksPage() {
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
              <Link href="/how-it-works" className="text-white font-semibold">
                How It Works
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50 mb-6">
              <span className="text-yellow-300 font-semibold">⚠️ Stellar Testnet - Demo Only</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              كيف يعمل AssetFi UAE
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              How AssetFi UAE Works
            </p>
            <p className="text-lg text-blue-300" dir="rtl" lang="ar">
              دليل شامل لفهم منصة تمويل الأصول المرمزة
            </p>
            <p className="text-base text-blue-300">
              Complete Guide to Understanding Our Tokenized Asset Finance Platform
            </p>
          </div>

          {/* Download Infographic */}
          <div className="mb-12 text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div>
                  <p className="text-white font-semibold mb-2" dir="rtl" lang="ar">
                    📊 حمّل الإنفوجرافيك التوضيحي
                  </p>
                  <p className="text-blue-200 text-sm">
                    Download Printable Infographic
                  </p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href="/infographics/assetfi-flow-ar.svg" 
                    download
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    SVG تحميل
                  </a>
                  <a 
                    href="/infographics/assetfi-flow-ar.png" 
                    download
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    PNG تحميل
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎯</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">نظرة عامة</h2>
                <p className="text-blue-200">Platform Overview</p>
              </div>
            </div>
            <div className="space-y-4 text-blue-100" dir="rtl" lang="ar">
              <p className="leading-relaxed text-lg">
                AssetFi UAE هي منصة تمويل أصول مبتكرة تجمع بين التمويل التقليدي وتقنية البلوكشين على شبكة Stellar، لتوفير حلول تمويل شفافة وفعالة للشركات الصغيرة والمتوسطة في الإمارات.
              </p>
              <p className="leading-relaxed text-base text-blue-200">
                AssetFi UAE is an innovative asset finance platform that combines traditional finance with blockchain technology on the Stellar network, providing transparent and efficient financing solutions for UAE SMEs.
              </p>
            </div>
          </section>

          {/* User Roles Section */}
          <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">👥</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">من يستخدم ماذا؟</h2>
                <p className="text-blue-200">Who Uses What?</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* SME */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🏢</div>
                  <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">الشركات الصغيرة</h3>
                  <p className="text-sm text-blue-200">SME Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                  <li>• تقديم طلبات التمويل</li>
                  <li>• رفع المستندات المطلوبة</li>
                  <li>• متابعة حالة الطلبات</li>
                  <li>• إدارة التسهيلات النشطة</li>
                  <li>• دفع الأقساط الشهرية</li>
                </ul>
              </div>

              {/* Underwriter */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">👨‍💼</div>
                  <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">مسؤول الاكتتاب</h3>
                  <p className="text-sm text-blue-200">Underwriter Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                  <li>• مراجعة طلبات التمويل</li>
                  <li>• فحص المستندات والتحقق</li>
                  <li>• مراجعة تقييم المخاطر</li>
                  <li>• الموافقة أو الرفض</li>
                  <li>• استخدام المساعد الذكي</li>
                </ul>
              </div>

              {/* Investor */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">💰</div>
                  <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">المستثمر</h3>
                  <p className="text-sm text-blue-200">Investor Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                  <li>• استعراض صناديق التمويل</li>
                  <li>• الاستثمار في الصناديق</li>
                  <li>• متابعة العوائد</li>
                  <li>• إدارة المحفظة</li>
                  <li>• عرض التوزيعات</li>
                </ul>
              </div>

              {/* Admin */}
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-orange-500/30">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">⚙️</div>
                  <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">المدير</h3>
                  <p className="text-sm text-blue-200">Admin Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                  <li>• إدارة المستخدمين</li>
                  <li>• إعدادات البلوكشين</li>
                  <li>• إنشاء صناديق التمويل</li>
                  <li>• مراجعة سجل التدقيق</li>
                  <li>• ضبط إعدادات النظام</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Main Flow - 6 Steps */}
          <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🔄</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">دورة التمويل الكاملة</h2>
                <p className="text-blue-200">Complete Financing Cycle</p>
              </div>
            </div>

            {/* Step 1: SME Application */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" dir="rtl" lang="ar">تقديم طلب التمويل</h3>
                  <p className="text-blue-200">SME Application Submission</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-6 border border-blue-500/30">
                <div className="space-y-3 text-blue-100" dir="rtl" lang="ar">
                  <p className="font-semibold text-white">الخطوات:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ الشركة تسجل الدخول إلى بوابة SME</li>
                    <li>✓ تملأ نموذج طلب التمويل (نوع الأصل، القيمة، المساهمة الشخصية)</li>
                    <li>✓ ترفع المستندات المطلوبة (سجل تجاري، قوائم مالية، هوية، إلخ)</li>
                    <li>✓ تحدد تفاصيل الأصل المراد تمويله (شاحنة، معدات، آلات)</li>
                    <li>✓ تقدم الطلب للمراجعة</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-500/20 rounded border border-blue-500/40">
                    <p className="text-sm text-blue-200">
                      <strong>Example:</strong> Gulf Logistics LLC applies for financing an Isuzu NPR truck worth AED 300,000, requesting AED 225,000 (75% LTV) over 36 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Risk Assessment */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" dir="rtl" lang="ar">تقييم المخاطر الآلي</h3>
                  <p className="text-blue-200">Automated Risk Assessment</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-6 border border-purple-500/30">
                <div className="space-y-3 text-blue-100" dir="rtl" lang="ar">
                  <p className="font-semibold text-white">محرك المخاطر ثلاثي الأبعاد (3D Risk Engine):</p>
                  <div className="grid md:grid-cols-3 gap-4 my-4">
                    <div className="bg-purple-500/20 rounded p-4 border border-purple-500/40">
                      <p className="font-semibold text-white mb-2">البعد 1: الشركة</p>
                      <p className="text-sm">عمر الشركة، الإيرادات، الربحية، التدفق النقدي، سجل الائتمان</p>
                    </div>
                    <div className="bg-purple-500/20 rounded p-4 border border-purple-500/40">
                      <p className="font-semibold text-white mb-2">البعد 2: الأصل</p>
                      <p className="text-sm">نوع الأصل، القيمة، قابلية إعادة البيع، معدل الاستهلاك، الطلب في السوق</p>
                    </div>
                    <div className="bg-purple-500/20 rounded p-4 border border-purple-500/40">
                      <p className="font-semibold text-white mb-2">البعد 3: الصفقة</p>
                      <p className="text-sm">نسبة القرض للقيمة، مدة التمويل، المساهمة الشخصية، الضمانات</p>
                    </div>
                  </div>
                  <p className="font-semibold text-white">النتيجة:</p>
                  <ul className="space-y-2 mr-6">
                    <li>• درجة المخاطر الإجمالية (0-100)</li>
                    <li>• تصنيف المخاطر: A (ممتاز) / B (جيد) / C (مقبول) / D (مرتفع المخاطر)</li>
                    <li>• شروط التمويل المقترحة (الفائدة، المدة، الضمانات)</li>
                    <li>• توصيات لتحسين الطلب</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3: Underwriter Review */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" dir="rtl" lang="ar">المراجعة البشرية</h3>
                  <p className="text-blue-200">Human Underwriter Review</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-lg p-6 border border-indigo-500/30">
                <div className="space-y-3 text-blue-100" dir="rtl" lang="ar">
                  <p className="font-semibold text-white">دور مسؤول الاكتتاب:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ مراجعة تقييم المخاطر الآلي والتحقق من دقته</li>
                    <li>✓ فحص جميع المستندات المرفقة والتأكد من صحتها</li>
                    <li>✓ التحقق من المعلومات المالية للشركة</li>
                    <li>✓ تقييم جدوى المشروع والغرض من الأصل</li>
                    <li>✓ استخدام المساعد الذكي للحصول على رؤى إضافية</li>
                    <li>✓ اتخاذ القرار النهائي: الموافقة / الرفض / طلب معلومات إضافية</li>
                  </ul>
                  <div className="mt-4 p-4 bg-indigo-500/20 rounded border border-indigo-500/40">
                    <p className="text-sm">
                      <strong className="text-white">AI Assistant:</strong> <span className="text-blue-200">يوفر المساعد الذكي تحليلًا تلقائيًا للمستندات، واستخراج البيانات الرئيسية، وتحديد العلامات الحمراء المحتملة.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Pool Creation & Investor Funding */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" dir="rtl" lang="ar">إنشاء الصناديق والتمويل</h3>
                  <p className="text-blue-200">Pool Creation & Investor Funding</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-6 border border-green-500/30">
                <div className="space-y-3 text-blue-100" dir="rtl" lang="ar">
                  <p className="font-semibold text-white">كيف تعمل صناديق التمويل:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ الطلبات الموافق عليها تُجمع في صناديق استثمارية حسب فئة المخاطر</li>
                    <li>✓ كل صندوق له مبلغ مستهدف، معدل عائد متوقع، ومدة زمنية</li>
                    <li>✓ المستثمرون المعتمدون يستطيعون الاطلاع على تفاصيل كل صندوق</li>
                    <li>✓ الحد الأدنى للاستثمار: 25,000 درهم إماراتي</li>
                    <li>✓ يمكن للمستثمرين المساهمة بأي مبلغ أعلى من الحد الأدنى</li>
                    <li>✓ عندما يصل الصندوق للمبلغ المستهدف، يتم إغلاقه وتفعيل التسهيلات</li>
                  </ul>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/20 rounded border border-green-500/40">
                      <p className="font-semibold text-white mb-2">مثال: صندوق المستوى B</p>
                      <p className="text-sm">
                        • المبلغ المستهدف: 2,000,000 درهم<br/>
                        • معدل العائد المتوقع: 8-10% سنويًا<br/>
                        • عدد التسهيلات: 8-10 شركات<br/>
                        • المدة: 24-36 شهر
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/20 rounded border border-green-500/40">
                      <p className="font-semibold text-white mb-2">حماية المستثمر</p>
                      <p className="text-sm">
                        • تنويع المحفظة عبر عدة شركات<br/>
                        • ضمانات على الأصول<br/>
                        • تأمين إضافي متاح<br/>
                        • شفافية كاملة عبر البلوكشين
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Blockchain Registration */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  5
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" dir="rtl" lang="ar">التسجيل على البلوكشين</h3>
                  <p className="text-blue-200">Blockchain Registration</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg p-6 border border-yellow-500/30">
                <div className="space-y-3 text-blue-100" dir="rtl" lang="ar">
                  <p className="font-semibold text-white">ما يتم تسجيله على شبكة Stellar:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ تفاصيل الأصل الممول (النوع، القيمة، الرقم التسلسلي)</li>
                    <li>✓ هاشات المستندات (لضمان عدم التلاعب)</li>
                    <li>✓ شروط التمويل (المبلغ، المدة، معدل الفائدة)</li>
                    <li>✓ معلومات المساهمين في الصندوق ونسبهم</li>
                    <li>✓ جدول الدفعات وتواريخ الاستحقاق</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-500/20 rounded border border-yellow-500/40">
                    <p className="font-semibold text-white mb-2">العقود الذكية (Soroban Smart Contracts):</p>
                    <p className="text-sm">
                      تدير العقود الذكية المكتوبة بلغة Rust دورة حياة التسهيل بالكامل: التسجيل، استلام الدفعات، توزيع العوائد، وإدارة الملكية عند اكتمال السداد.
                    </p>
                  </div>
                  <div className="mt-4 p-4 bg-red-500/20 rounded border border-red-500/40">
                    <p className="font-semibold text-white mb-2">⚠️ ملاحظة مهمة:</p>
                    <p className="text-sm">
                      النسخة الحالية تستخدم Stellar Testnet مع محاكاة المعاملات. النشر الفعلي لعقود Rust Soroban على Mainnet سيتم في المراحل القادمة بعد الحصول على التراخيص اللازمة.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6: Repayments & Distributions */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  6
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" dir="rtl" lang="ar">السداد والتوزيعات</h3>
                  <p className="text-blue-200">Repayments & Distributions</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg p-6 border border-red-500/30">
                <div className="space-y-3 text-blue-100" dir="rtl" lang="ar">
                  <p className="font-semibold text-white">دورة الدفع الشهرية:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ الشركة تدفع القسط الشهري (أصل + فائدة) عبر بوابة SME</li>
                    <li>✓ يتم تسجيل الدفع على البلوكشين بشكل فوري</li>
                    <li>✓ العقد الذكي يحسب نصيب كل مستثمر تلقائيًا حسب نسبته</li>
                    <li>✓ يتم توزيع العوائد على محافظ المستثمرين فورًا</li>
                    <li>✓ المستثمرون يستطيعون رؤية جميع الدفعات والتوزيعات في الوقت الفعلي</li>
                  </ul>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/20 rounded border border-red-500/40">
                      <p className="font-semibold text-white mb-2">الشفافية الكاملة</p>
                      <p className="text-sm">
                        كل معاملة مسجلة على البلوكشين. المستثمرون يستطيعون تتبع كل درهم من استثمارهم وعوائدهم.
                      </p>
                    </div>
                    <div className="p-4 bg-red-500/20 rounded border border-red-500/40">
                      <p className="font-semibold text-white mb-2">التوزيع الآلي</p>
                      <p className="text-sm">
                        لا حاجة لتدخل بشري. العقود الذكية تضمن توزيع العوائد بدقة وسرعة.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-green-500/20 rounded border border-green-500/40">
                    <p className="font-semibold text-white mb-2">🎉 اكتمال السداد</p>
                    <p className="text-sm">
                      عند سداد آخر قسط، يتم نقل ملكية الأصل بالكامل للشركة تلقائيًا. المستثمرون يحصلون على العائد الكامل + استرداد رأس المال.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Admin & Blockchain Settings */}
          <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⚙️</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">إعدادات المدير والبلوكشين</h2>
                <p className="text-blue-200">Admin & Blockchain Settings</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-xl font-bold text-white mb-3" dir="rtl" lang="ar">بوابة المدير</h3>
                <div className="text-blue-100" dir="rtl" lang="ar">
                  <p className="mb-3">المدير لديه صلاحيات كاملة لإدارة المنصة:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 mr-6">
                      <li>• إدارة المستخدمين (إضافة، تعديل، حذف)</li>
                      <li>• تعيين الأدوار والصلاحيات</li>
                      <li>• إنشاء وإدارة صناديق التمويل</li>
                      <li>• ضبط معايير تقييم المخاطر</li>
                    </ul>
                    <ul className="space-y-2 mr-6">
                      <li>• مراجعة سجل التدقيق الشامل</li>
                      <li>• إعدادات الاتصال بشبكة Stellar</li>
                      <li>• إدارة العقود الذكية</li>
                      <li>• تصدير التقارير والإحصائيات</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-3" dir="rtl" lang="ar">إعدادات البلوكشين (/admin/blockchain)</h3>
                <div className="text-blue-100" dir="rtl" lang="ar">
                  <p className="mb-3">صفحة مخصصة لإدارة الاتصال مع شبكة Stellar:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ اختيار الشبكة: Testnet / Public (Mainnet)</li>
                    <li>✓ إدارة محافظ النظام (Issuer, Distribution)</li>
                    <li>✓ ضبط معلمات العقود الذكية</li>
                    <li>✓ مراقبة حالة الاتصال والمعاملات</li>
                    <li>✓ عرض سجل جميع المعاملات على البلوكشين</li>
                    <li>✓ استكشاف الأخطاء وحل المشاكل</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-500/20 rounded border border-blue-500/40">
                    <p className="text-sm text-blue-200">
                      <strong>Audit Trail:</strong> كل عملية على المنصة مسجلة مع الطابع الزمني، المستخدم المنفذ، والتفاصيل الكاملة للعملية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Engine Deep Dive */}
          <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🤖</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">محرك تقييم المخاطر</h2>
                <p className="text-blue-200">Risk Assessment Engine</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-blue-100" dir="rtl" lang="ar">
                <p className="mb-4 leading-relaxed text-lg">
                  محرك تقييم المخاطر هو القلب الذكي للمنصة. يستخدم منهجية ثلاثية الأبعاد لتقييم كل طلب تمويل بشكل شامل ودقيق.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🏢</div>
                    <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">بُعد الشركة</h3>
                    <p className="text-sm text-blue-200">Company Dimension</p>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                    <li>• عمر الشركة ونشاطها</li>
                    <li>• الإيرادات السنوية</li>
                    <li>• هامش الربح</li>
                    <li>• التدفق النقدي</li>
                    <li>• سجل الائتمان</li>
                    <li>• الالتزامات الحالية</li>
                    <li>• نسبة الديون للأصول</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🚚</div>
                    <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">بُعد الأصل</h3>
                    <p className="text-sm text-blue-200">Asset Dimension</p>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                    <li>• نوع الأصل وفئته</li>
                    <li>• قيمة الأصل الحالية</li>
                    <li>• معدل الاستهلاك السنوي</li>
                    <li>• قابلية إعادة البيع</li>
                    <li>• الطلب في السوق المحلي</li>
                    <li>• تكاليف الصيانة المتوقعة</li>
                    <li>• العمر الإنتاجي المتبقي</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="text-xl font-bold text-white" dir="rtl" lang="ar">بُعد الصفقة</h3>
                    <p className="text-sm text-blue-200">Deal Dimension</p>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-100" dir="rtl" lang="ar">
                    <li>• نسبة القرض للقيمة (LTV)</li>
                    <li>• مدة التمويل</li>
                    <li>• المساهمة الشخصية</li>
                    <li>• الضمانات الإضافية</li>
                    <li>• القسط الشهري/الإيرادات</li>
                    <li>• التأمين والتغطيات</li>
                    <li>• شروط السداد المبكر</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-6 border border-yellow-500/30 mt-4">
                <h3 className="text-xl font-bold text-white mb-3" dir="rtl" lang="ar">مستويات المخاطر والشروط</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-green-500/20 rounded p-4 border border-green-500/40">
                    <p className="font-bold text-white text-lg mb-2" dir="rtl" lang="ar">فئة A</p>
                    <p className="text-sm text-blue-100" dir="rtl" lang="ar">
                      • درجة: 80-100<br/>
                      • فائدة: 6-8%<br/>
                      • LTV: حتى 80%<br/>
                      • موافقة سريعة
                    </p>
                  </div>
                  <div className="bg-blue-500/20 rounded p-4 border border-blue-500/40">
                    <p className="font-bold text-white text-lg mb-2" dir="rtl" lang="ar">فئة B</p>
                    <p className="text-sm text-blue-100" dir="rtl" lang="ar">
                      • درجة: 60-79<br/>
                      • فائدة: 8-10%<br/>
                      • LTV: حتى 75%<br/>
                      • مراجعة قياسية
                    </p>
                  </div>
                  <div className="bg-yellow-500/20 rounded p-4 border border-yellow-500/40">
                    <p className="font-bold text-white text-lg mb-2" dir="rtl" lang="ar">فئة C</p>
                    <p className="text-sm text-blue-100" dir="rtl" lang="ar">
                      • درجة: 40-59<br/>
                      • فائدة: 10-13%<br/>
                      • LTV: حتى 65%<br/>
                      • ضمانات إضافية
                    </p>
                  </div>
                  <div className="bg-red-500/20 rounded p-4 border border-red-500/40">
                    <p className="font-bold text-white text-lg mb-2" dir="rtl" lang="ar">فئة D</p>
                    <p className="text-sm text-blue-100" dir="rtl" lang="ar">
                      • درجة: 0-39<br/>
                      • فائدة: 13%+<br/>
                      • LTV: حتى 50%<br/>
                      • مراجعة مكثفة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testnet Caveat */}
          <section className="bg-red-500/20 rounded-2xl p-8 border border-red-500/50 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">تنبيه مهم: Testnet فقط</h2>
                <p className="text-blue-200">Important Notice: Testnet Only</p>
              </div>
            </div>
            <div className="space-y-4 text-red-100">
              <div className="bg-red-500/30 rounded-lg p-6 border border-red-500/50" dir="rtl" lang="ar">
                <p className="leading-relaxed font-semibold text-white mb-3">
                  🚨 هذه النسخة عرض تقني تجريبي فقط (Testnet Demo)
                </p>
                <ul className="space-y-2 mr-6">
                  <li>• لا تستخدم أموال حقيقية أو معلومات مالية حقيقية</li>
                  <li>• جميع المعاملات محاكاة على Stellar Testnet</li>
                  <li>• العقود الذكية حالياً stubs مكتوبة بـ TypeScript (لا توجد عقود Rust Soroban حقيقية بعد)</li>
                  <li>• البيانات التجريبية (مثل Gulf Logistics) خيالية</li>
                  <li>• المنصة غير مرخصة لإجراء عمليات تمويل حقيقية</li>
                </ul>
              </div>
              <div className="bg-red-500/30 rounded-lg p-6 border border-red-500/50">
                <p className="font-semibold text-white mb-2">For Real Operations, AssetFi Requires:</p>
                <ul className="space-y-2 text-sm">
                  <li>✓ Valid finance company license from CBUAE (Central Bank of UAE)</li>
                  <li>✓ Securities framework approval if applicable (ADGM/DFSA)</li>
                  <li>✓ Real Rust Soroban smart contracts deployed on Mainnet</li>
                  <li>✓ Partnership with licensed AED stablecoin issuer</li>
                  <li>✓ Full KYC/AML compliance infrastructure</li>
                  <li>✓ Third-party security and legal audits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Visual Flow Diagram */}
          <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📊</span>
              <div>
                <h2 className="text-3xl font-bold text-white" dir="rtl" lang="ar">المخطط البصري للدورة</h2>
                <p className="text-blue-200">Visual Flow Diagram</p>
              </div>
            </div>
            
            {/* Simple CSS Flow Diagram */}
            <div className="relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-1">🏢</div>
                      <div className="text-xs font-bold">SME Apply</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200 text-center">Step 1</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-1">🤖</div>
                      <div className="text-xs font-bold">Risk Score</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200 text-center">Step 2</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-1">👨‍💼</div>
                      <div className="text-xs font-bold">Review</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200 text-center">Step 3</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 4 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-1">💰</div>
                      <div className="text-xs font-bold">Pool Fund</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200 text-center">Step 4</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 5 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-1">⛓️</div>
                      <div className="text-xs font-bold">Blockchain</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200 text-center">Step 5</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 6 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-1">📊</div>
                      <div className="text-xs font-bold">Distribute</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-200 text-center">Step 6</div>
                </div>

              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-4" dir="rtl" lang="ar">
                جاهز لتجربة المنصة؟
              </h2>
              <p className="text-blue-200 mb-6">
                Ready to Try the Platform?
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg text-lg transition-colors"
                >
                  🎬 Try Live Demo
                </Link>
                <Link
                  href="/whitepaper"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-lg transition-colors border border-white/20"
                >
                  📄 Read Whitepaper
                </Link>
              </div>
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
  );
}
