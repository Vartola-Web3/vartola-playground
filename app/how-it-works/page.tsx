import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      <SiteNav />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6 inline-block rounded-full bg-amber-50 px-4 py-2">
              <span className="text-sm font-medium text-amber-900">Stellar testnet · demo only</span>
            </div>
            <h1 className="text-5xl font-bold text-[#0F172A] mb-4">
              كيف يعمل AssetFi UAE
            </h1>
            <p className="text-xl text-[#475569] mb-2">
              How AssetFi UAE Works
            </p>
            <p className="text-lg text-[#475569]" dir="rtl" lang="ar">
              دليل شامل لفهم منصة تمويل الأصول المرمزة
            </p>
            <p className="text-base text-[#475569]">
              Complete Guide to Understanding Our Tokenized Asset Finance Platform
            </p>
          </div>

          {/* Download Infographic */}
          <div className="mb-12 text-center">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div>
                  <p className="text-[#0F172A] font-semibold mb-2" dir="rtl" lang="ar">
                    📊 حمّل الإنفوجرافيك التوضيحي
                  </p>
                  <p className="text-[#475569] text-sm">
                    Download Printable Infographic
                  </p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href="/infographics/assetfi-flow-ar.svg" 
                    download
                    className="px-4 py-2 bg-[#0B1F4D] text-white hover:bg-[#132a66] font-semibold rounded-lg transition-colors"
                  >
                    SVG تحميل
                  </a>
                  <a 
                    href="/infographics/assetfi-flow-ar.png" 
                    download
                    className="px-4 py-2 bg-[#1D4ED8] text-white hover:bg-[#1e40af] font-semibold rounded-lg transition-colors"
                  >
                    PNG تحميل
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🎯</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">نظرة عامة</h2>
                <p className="text-[#475569]">Platform Overview</p>
              </div>
            </div>
            <div className="space-y-4 text-[#475569]" dir="rtl" lang="ar">
              <p className="leading-relaxed text-lg">
                AssetFi UAE هي منصة تمويل أصول مبتكرة تجمع بين التمويل التقليدي وتقنية البلوكشين على شبكة Stellar، لتوفير حلول تمويل شفافة وفعالة للشركات الصغيرة والمتوسطة في الإمارات. التركيز الحالي هو أسطول التوصيل والنقل: دراجات، فانات، بيك أب، وشاحنات.
              </p>
              <p className="leading-relaxed text-base text-[#475569]">
                AssetFi UAE is an innovative asset finance platform that combines traditional finance with blockchain technology on the Stellar network, providing transparent and efficient financing solutions for UAE SMEs.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🚚</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">دورة تمويل الأسطول</h2>
                <p className="text-[#475569]">Fleet finance lifecycle</p>
              </div>
            </div>
            <ol className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
              <li>الشركة تقدم طلب مركبة بعدد وحدات وقيمة ومدة، وترفع المستندات، وتتابع التذكرة مع المراجع.</li>
              <li>الموافقة تنشئ تسهيلاً. الإدارة تربطه بفرصة استثمار، وحجم الفرصة هو مجموع مبالغ الأصول.</li>
              <li>المستثمر يختار مبلغاً ضمن الحد الأدنى والمتاح. رأس المال يبقى محجوزاً، والعائد لا يبدأ عند الاكتتاب.</li>
              <li>بعد اكتمال التمويل تُراجع شروط الإفراج، وتُسجَّل الأموال للمستفيد المعتمد وليس للشركة مباشرة.</li>
              <li>بعد تأكيد التسليم يصبح التسهيل نشطاً، ويتحول المحجوز في هذا التسهيل فقط إلى رأس مال منشور.</li>
              <li>كل قسط يُوزَّع على المستثمرين المنشورين في ذلك التسهيل. يمكن تسجيل تسوية مبكرة أو تأخر أو تعثر واسترداد.</li>
            </ol>
          </section>

          {/* User Roles Section */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">👥</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">من يستخدم ماذا؟</h2>
                <p className="text-[#475569]">Who Uses What?</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* SME */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🏢</div>
                  <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">الشركات الصغيرة</h3>
                  <p className="text-sm text-[#475569]">SME Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
                  <li>• تقديم طلبات التمويل</li>
                  <li>• رفع المستندات المطلوبة</li>
                  <li>• متابعة حالة الطلبات</li>
                  <li>• إدارة التسهيلات النشطة</li>
                  <li>• دفع الأقساط الشهرية</li>
                </ul>
              </div>

              {/* Underwriter */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">👨‍💼</div>
                  <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">مسؤول الاكتتاب</h3>
                  <p className="text-sm text-[#475569]">Underwriter Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
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
                  <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">المستثمر</h3>
                  <p className="text-sm text-[#475569]">Investor Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
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
                  <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">المدير</h3>
                  <p className="text-sm text-[#475569]">Admin Portal</p>
                </div>
                <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
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
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🔄</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">دورة التمويل الكاملة</h2>
                <p className="text-[#475569]">Complete Financing Cycle</p>
              </div>
            </div>

            {/* Step 1: SME Application */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]" dir="rtl" lang="ar">تقديم طلب التمويل</h3>
                  <p className="text-[#475569]">SME Application Submission</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-6 border border-blue-500/30">
                <div className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
                  <p className="font-semibold text-[#0F172A]">الخطوات:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ الشركة تسجل الدخول إلى بوابة SME</li>
                    <li>✓ تملأ نموذج طلب التمويل (نوع الأصل، القيمة، المساهمة الشخصية)</li>
                    <li>✓ ترفع المستندات المطلوبة (سجل تجاري، قوائم مالية، هوية، إلخ)</li>
                    <li>✓ تحدد تفاصيل الأصل المراد تمويله (شاحنة، معدات، آلات)</li>
                    <li>✓ تقدم الطلب للمراجعة</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-500/20 rounded border border-blue-500/40">
                    <p className="text-sm text-[#475569]">
                      <strong>Example:</strong> Gulf Logistics LLC applies for financing an Isuzu NPR truck worth AED 300,000, requesting AED 225,000 (75% LTV) over 36 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Risk Assessment */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]" dir="rtl" lang="ar">تقييم المخاطر الآلي</h3>
                  <p className="text-[#475569]">Automated Risk Assessment</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-6 border border-purple-500/30">
                <div className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
                  <p className="font-semibold text-[#0F172A]">محرك المخاطر ثلاثي الأبعاد (3D Risk Engine):</p>
                  <div className="grid md:grid-cols-3 gap-4 my-4">
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] p-4">
                      <p className="font-semibold text-[#0F172A] mb-2">البعد 1: الشركة</p>
                      <p className="text-sm">عمر الشركة، الإيرادات، الربحية، التدفق النقدي، سجل الائتمان</p>
                    </div>
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] p-4">
                      <p className="font-semibold text-[#0F172A] mb-2">البعد 2: الأصل</p>
                      <p className="text-sm">نوع الأصل، القيمة، قابلية إعادة البيع، معدل الاستهلاك، الطلب في السوق</p>
                    </div>
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] p-4">
                      <p className="font-semibold text-[#0F172A] mb-2">البعد 3: الصفقة</p>
                      <p className="text-sm">نسبة القرض للقيمة، مدة التمويل، المساهمة الشخصية، الضمانات</p>
                    </div>
                  </div>
                  <p className="font-semibold text-[#0F172A]">النتيجة:</p>
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
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]" dir="rtl" lang="ar">المراجعة البشرية</h3>
                  <p className="text-[#475569]">Human Underwriter Review</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-lg p-6 border border-indigo-500/30">
                <div className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
                  <p className="font-semibold text-[#0F172A]">دور مسؤول الاكتتاب:</p>
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
                      <strong className="text-[#0F172A]">AI Assistant:</strong> <span className="text-[#475569]">يوفر المساعد الذكي تحليلًا تلقائيًا للمستندات، واستخراج البيانات الرئيسية، وتحديد العلامات الحمراء المحتملة.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Pool Creation & Investor Funding */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]" dir="rtl" lang="ar">إنشاء الصناديق والتمويل</h3>
                  <p className="text-[#475569]">Pool Creation & Investor Funding</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-6 border border-green-500/30">
                <div className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
                  <p className="font-semibold text-[#0F172A]">كيف تعمل صناديق التمويل:</p>
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
                      <p className="font-semibold text-[#0F172A] mb-2">مثال: صندوق المستوى B</p>
                      <p className="text-sm">
                        • المبلغ المستهدف: 2,000,000 درهم<br/>
                        • معدل العائد المتوقع: 8-10% سنويًا<br/>
                        • عدد التسهيلات: 8-10 شركات<br/>
                        • المدة: 24-36 شهر
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/20 rounded border border-green-500/40">
                      <p className="font-semibold text-[#0F172A] mb-2">حماية المستثمر</p>
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
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl">
                  5
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]" dir="rtl" lang="ar">التسجيل على البلوكشين</h3>
                  <p className="text-[#475569]">Blockchain Registration</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg p-6 border border-yellow-500/30">
                <div className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
                  <p className="font-semibold text-[#0F172A]">ما يتم تسجيله على شبكة Stellar:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ تفاصيل الأصل الممول (النوع، القيمة، الرقم التسلسلي)</li>
                    <li>✓ هاشات المستندات (لضمان عدم التلاعب)</li>
                    <li>✓ شروط التمويل (المبلغ، المدة، معدل الفائدة)</li>
                    <li>✓ معلومات المساهمين في الصندوق ونسبهم</li>
                    <li>✓ جدول الدفعات وتواريخ الاستحقاق</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-500/20 rounded border border-yellow-500/40">
                    <p className="font-semibold text-[#0F172A] mb-2">العقود الذكية (Soroban Smart Contracts):</p>
                    <p className="text-sm">
                      تدير العقود الذكية المكتوبة بلغة Rust دورة حياة التسهيل بالكامل: التسجيل، استلام الدفعات، توزيع العوائد، وإدارة الملكية عند اكتمال السداد.
                    </p>
                  </div>
                  <div className="mt-4 p-4 bg-red-500/20 rounded border border-red-500/40">
                    <p className="font-semibold text-[#0F172A] mb-2">⚠️ ملاحظة مهمة:</p>
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
                <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl">
                  6
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]" dir="rtl" lang="ar">السداد والتوزيعات</h3>
                  <p className="text-[#475569]">Repayments & Distributions</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg p-6 border border-red-500/30">
                <div className="space-y-3 text-[#475569]" dir="rtl" lang="ar">
                  <p className="font-semibold text-[#0F172A]">دورة الدفع الشهرية:</p>
                  <ul className="space-y-2 mr-6">
                    <li>✓ الشركة تدفع القسط الشهري (أصل + فائدة) عبر بوابة SME</li>
                    <li>✓ يتم تسجيل الدفع على البلوكشين بشكل فوري</li>
                    <li>✓ العقد الذكي يحسب نصيب كل مستثمر تلقائيًا حسب نسبته</li>
                    <li>✓ يتم توزيع العوائد على محافظ المستثمرين فورًا</li>
                    <li>✓ المستثمرون يستطيعون رؤية جميع الدفعات والتوزيعات في الوقت الفعلي</li>
                  </ul>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/20 rounded border border-red-500/40">
                      <p className="font-semibold text-[#0F172A] mb-2">الشفافية الكاملة</p>
                      <p className="text-sm">
                        كل معاملة مسجلة على البلوكشين. المستثمرون يستطيعون تتبع كل درهم من استثمارهم وعوائدهم.
                      </p>
                    </div>
                    <div className="p-4 bg-red-500/20 rounded border border-red-500/40">
                      <p className="font-semibold text-[#0F172A] mb-2">التوزيع الآلي</p>
                      <p className="text-sm">
                        لا حاجة لتدخل بشري. العقود الذكية تضمن توزيع العوائد بدقة وسرعة.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-green-500/20 rounded border border-green-500/40">
                    <p className="font-semibold text-[#0F172A] mb-2">🎉 اكتمال السداد</p>
                    <p className="text-sm">
                      عند سداد آخر قسط، يتم نقل ملكية الأصل بالكامل للشركة تلقائيًا. المستثمرون يحصلون على العائد الكامل + استرداد رأس المال.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Admin & Blockchain Settings */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⚙️</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">إعدادات المدير والبلوكشين</h2>
                <p className="text-[#475569]">Admin & Blockchain Settings</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-6 border border-orange-500/30">
                <h3 className="text-xl font-bold text-[#0F172A] mb-3" dir="rtl" lang="ar">بوابة المدير</h3>
                <div className="text-[#475569]" dir="rtl" lang="ar">
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
                <h3 className="text-xl font-bold text-[#0F172A] mb-3" dir="rtl" lang="ar">إعدادات البلوكشين (/admin/blockchain)</h3>
                <div className="text-[#475569]" dir="rtl" lang="ar">
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
                    <p className="text-sm text-[#475569]">
                      <strong>Audit Trail:</strong> كل عملية على المنصة مسجلة مع الطابع الزمني، المستخدم المنفذ، والتفاصيل الكاملة للعملية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Engine Deep Dive */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🤖</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">محرك تقييم المخاطر</h2>
                <p className="text-[#475569]">Risk Assessment Engine</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-[#475569]" dir="rtl" lang="ar">
                <p className="mb-4 leading-relaxed text-lg">
                  محرك تقييم المخاطر هو القلب الذكي للمنصة. يستخدم منهجية ثلاثية الأبعاد لتقييم كل طلب تمويل بشكل شامل ودقيق.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🏢</div>
                    <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">بُعد الشركة</h3>
                    <p className="text-sm text-[#475569]">Company Dimension</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
                    <li>• عمر الشركة ونشاطها</li>
                    <li>• الإيرادات السنوية</li>
                    <li>• هامش الربح</li>
                    <li>• التدفق النقدي</li>
                    <li>• سجل الائتمان</li>
                    <li>• الالتزامات الحالية</li>
                    <li>• نسبة الديون للأصول</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🚚</div>
                    <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">بُعد الأصل</h3>
                    <p className="text-sm text-[#475569]">Asset Dimension</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
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
                    <h3 className="text-xl font-bold text-[#0F172A]" dir="rtl" lang="ar">بُعد الصفقة</h3>
                    <p className="text-sm text-[#475569]">Deal Dimension</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#475569]" dir="rtl" lang="ar">
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
                <h3 className="text-xl font-bold text-[#0F172A] mb-3" dir="rtl" lang="ar">مستويات المخاطر والشروط</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-green-500/20 rounded p-4 border border-green-500/40">
                    <p className="font-bold text-[#0F172A] text-lg mb-2" dir="rtl" lang="ar">فئة A</p>
                    <p className="text-sm text-[#475569]" dir="rtl" lang="ar">
                      • درجة: 80-100<br/>
                      • فائدة: 6-8%<br/>
                      • LTV: حتى 80%<br/>
                      • موافقة سريعة
                    </p>
                  </div>
                  <div className="bg-blue-500/20 rounded p-4 border border-blue-500/40">
                    <p className="font-bold text-[#0F172A] text-lg mb-2" dir="rtl" lang="ar">فئة B</p>
                    <p className="text-sm text-[#475569]" dir="rtl" lang="ar">
                      • درجة: 60-79<br/>
                      • فائدة: 8-10%<br/>
                      • LTV: حتى 75%<br/>
                      • مراجعة قياسية
                    </p>
                  </div>
                  <div className="bg-yellow-500/20 rounded p-4 border border-yellow-500/40">
                    <p className="font-bold text-[#0F172A] text-lg mb-2" dir="rtl" lang="ar">فئة C</p>
                    <p className="text-sm text-[#475569]" dir="rtl" lang="ar">
                      • درجة: 40-59<br/>
                      • فائدة: 10-13%<br/>
                      • LTV: حتى 65%<br/>
                      • ضمانات إضافية
                    </p>
                  </div>
                  <div className="bg-red-500/20 rounded p-4 border border-red-500/40">
                    <p className="font-bold text-[#0F172A] text-lg mb-2" dir="rtl" lang="ar">فئة D</p>
                    <p className="text-sm text-[#475569]" dir="rtl" lang="ar">
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
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">تنبيه مهم: Testnet فقط</h2>
                <p className="text-[#475569]">Important Notice: Testnet Only</p>
              </div>
            </div>
            <div className="space-y-4 text-red-100">
              <div className="rounded-xl border border-rose-200 bg-white p-6" dir="rtl" lang="ar">
                <p className="leading-relaxed font-semibold text-[#0F172A] mb-3">
                  🚨 هذه النسخة عرض تقني تجريبي فقط (Testnet Demo)
                </p>
                <ul className="space-y-2 mr-6">
                  <li>• لا تستخدم أموال حقيقية أو معلومات مالية حقيقية</li>
                  <li>• جميع المعاملات محاكاة على Stellar Testnet</li>
                  <li>• العقود على الشبكة ما زالت محاكاة؛ دورة الإفراج والأقساط تعمل داخل التطبيق</li>
                  <li>• البيانات التجريبية (مثل Gulf Logistics) خيالية</li>
                  <li>• المنصة غير مرخصة لإجراء عمليات تمويل حقيقية</li>
                </ul>
              </div>
              <div className="rounded-xl border border-rose-200 bg-white p-6">
                <p className="font-semibold text-[#0F172A] mb-2">For Real Operations, AssetFi Requires:</p>
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
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📊</span>
              <div>
                <h2 className="text-3xl font-bold text-[#0F172A]" dir="rtl" lang="ar">المخطط البصري للدورة</h2>
                <p className="text-[#475569]">Visual Flow Diagram</p>
              </div>
            </div>
            
            {/* Simple CSS Flow Diagram */}
            <div className="relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-[#0F172A]">
                      <div className="text-3xl mb-1">🏢</div>
                      <div className="text-xs font-bold">SME Apply</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#475569] text-center">Step 1</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-[#0F172A]">
                      <div className="text-3xl mb-1">🤖</div>
                      <div className="text-xs font-bold">Risk Score</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#475569] text-center">Step 2</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-[#0F172A]">
                      <div className="text-3xl mb-1">👨‍💼</div>
                      <div className="text-xs font-bold">Review</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#475569] text-center">Step 3</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 4 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-[#0F172A]">
                      <div className="text-3xl mb-1">💰</div>
                      <div className="text-xs font-bold">Pool Fund</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#475569] text-center">Step 4</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 5 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-[#0F172A]">
                      <div className="text-3xl mb-1">⛓️</div>
                      <div className="text-xs font-bold">Blockchain</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#475569] text-center">Step 5</div>
                </div>

                <div className="hidden md:block text-3xl text-blue-400">→</div>

                {/* Step 6 */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-center text-[#0F172A]">
                      <div className="text-3xl mb-1">📊</div>
                      <div className="text-xs font-bold">Distribute</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-[#475569] text-center">Step 6</div>
                </div>

              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center mb-8">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4" dir="rtl" lang="ar">
                جاهز لتجربة المنصة؟
              </h2>
              <p className="text-[#475569] mb-6">
                Ready to Try the Platform?
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/login"
                  className="rounded-xl bg-[#1D4ED8] px-8 py-4 text-lg font-medium text-white"
                >
                  🎬 Try Live Demo
                </Link>
                <Link
                  href="/whitepaper"
                  className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-4 text-lg font-medium text-[#0F172A]"
                >
                  📄 Read Whitepaper
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
