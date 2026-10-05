import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

export default function DocumentsPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />

      <div className="vartola-frame py-12">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50 mb-6">
              <span className="text-yellow-300 font-semibold">Working Alpha · not a licensed financing offer · do not upload real identity documents</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Required Documents & KYC Checklist
            </h1>
            <p className="text-xl text-blue-200">
              Documentation requirements for SMEs, Investors, and Underwriters
            </p>
            <p className="text-lg text-blue-300 mt-2" dir="rtl" lang="ar">
              المستندات المطلوبة ومتطلبات KYC للشركات والمستثمرين والمكتتبين
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">

            {/* Important Notice */}
            <div className="bg-red-500/20 rounded-xl p-6 border border-red-500/50">
              <h2 className="text-2xl font-bold text-red-200 mb-3">⚠️ Important Notice | إشعار هام</h2>
              <div className="space-y-2 text-red-100 text-sm">
                <p>
                  <strong>English:</strong> Vartola is a working Alpha from RIMAL TECH - FZCO. It is not licensed to take real applications, documents, or investments. This page lists documents a future licensed process would require. Do not submit real personal or business documents here.
                </p>
                <p dir="rtl" lang="ar">
                  <strong>العربية:</strong> فارتولا منصة عاملة ضمن مرحلة ألفا لشركة RIMAL TECH - FZCO. ليست مرخصة لقبول طلبات أو مستندات أو استثمارات حقيقية. تعرض هذه الصفحة الوثائق التي قد يطلبها مسار مرخص لاحقاً. لا ترسل مستندات شخصية أو تجارية حقيقية هنا.
                </p>
              </div>
            </div>

            {/* For SMEs */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏢</span>
                <h2 className="text-3xl font-bold text-white">For SMEs (Financing Applicants)</h2>
              </div>
              <p className="text-blue-200 mb-6" dir="rtl" lang="ar">
                للشركات الصغيرة والمتوسطة (المتقدمون للتمويل)
              </p>

              <div className="space-y-6">
                {/* Company Documents */}
                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">1. Company Documents | وثائق الشركة</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Trade License (DED/DED) | الرخصة التجارية:</strong>
                        <p className="text-sm mt-1">Valid UAE trade license issued by Department of Economic Development. Must show company name, license number, activities, and expiry date. Arabic or English accepted.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF or JPG | Max 5MB</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Memorandum of Association | عقد التأسيس:</strong>
                        <p className="text-sm mt-1">Company formation documents showing ownership structure, authorized signatories, and share capital.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF | Max 10MB</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Certificate of Incorporation | شهادة التأسيس:</strong>
                        <p className="text-sm mt-1">Official company registration certificate from relevant authority (DED, ADGM, DIFC, Free Zone).</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF | Max 5MB</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Financial Documents */}
                <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">2. Financial Documents | الوثائق المالية</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Bank Statements | كشوفات حسابات بنكية:</strong>
                        <p className="text-sm mt-1">Last 6 months of business bank account statements showing revenue, expenses, and cash flow. All pages required.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF (bank-issued) | Max 20MB</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Financial Statements | القوائم المالية:</strong>
                        <p className="text-sm mt-1">Latest audited or management accounts: Balance Sheet, Income Statement, Cash Flow Statement. For companies &gt;3 years, last 2 years required.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF | Max 15MB</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-400 text-xl flex-shrink-0">○</span>
                      <div>
                        <strong className="text-white">Tax Returns (if applicable) | الإقرارات الضريبية:</strong>
                        <p className="text-sm mt-1">VAT returns or Corporate Tax filings if business is registered. Optional but strengthens application.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF | Max 10MB</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Owner/Signatory Documents */}
                <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">3. Owner/Signatory Documents | وثائق المالك/المفوض بالتوقيع</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Emirates ID | الهوية الإماراتية:</strong>
                        <p className="text-sm mt-1">Copy of valid Emirates ID for all company owners and authorized signatories. Both sides required. Must be clear and readable.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF or JPG | Max 2MB per person</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Passport Copy | نسخة جواز السفر:</strong>
                        <p className="text-sm mt-1">Valid passport copy (information page) for all owners and signatories.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF or JPG | Max 2MB per person</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Visa Page | صفحة التأشيرة:</strong>
                        <p className="text-sm mt-1">UAE residence visa page (for expatriate owners/signatories).</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF or JPG | Max 2MB per person</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Asset Documents */}
                <div className="bg-orange-500/10 rounded-lg p-6 border border-orange-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">4. Asset-Specific Documents | وثائق خاصة بالأصل</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Supplier Invoice/Proforma | فاتورة المورد:</strong>
                        <p className="text-sm mt-1">Official invoice or proforma invoice from asset supplier showing asset details, price, and specifications.</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF | Max 5MB</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Asset Specifications | مواصفات الأصل:</strong>
                        <p className="text-sm mt-1">Technical specifications, brochures, or photos of the asset. For vehicles: make, model, year, VIN (if known).</p>
                        <p className="text-sm mt-1 text-blue-300">Format: PDF or JPG | Max 10MB</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-orange-400 text-xl flex-shrink-0">○</span>
                      <div>
                        <strong className="text-white">Usage Justification | مبرر الاستخدام:</strong>
                        <p className="text-sm mt-1">Brief explanation of how the asset will be used in business operations (can be submitted in application form).</p>
                        <p className="text-sm mt-1 text-blue-300">Format: Text or PDF | Max 2 pages</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-blue-500/20 rounded-lg p-4 border border-blue-500/50">
                <p className="text-blue-200 text-sm">
                  <strong>Note:</strong> All documents must be valid and not expired. Documents in Arabic are acceptable; English translation may be requested during underwriting. The risk engine uses document completeness as a scoring factor (5% weight in Company Risk Score).
                </p>
              </div>
            </section>

            {/* For Investors */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">💰</span>
                <h2 className="text-3xl font-bold text-white">For Investors</h2>
              </div>
              <p className="text-blue-200 mb-6" dir="rtl" lang="ar">
                للمستثمرين
              </p>

              <div className="space-y-6">
                {/* Individual Investors */}
                <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">Individual Investors | المستثمرون الأفراد</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Emirates ID | الهوية الإماراتية:</strong>
                        <p className="text-sm mt-1">Valid Emirates ID (both sides). For UAE nationals and residents.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Passport & Visa | جواز السفر والتأشيرة:</strong>
                        <p className="text-sm mt-1">Valid passport (information page) and UAE residence visa (for expats).</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Proof of Address | إثبات العنوان:</strong>
                        <p className="text-sm mt-1">Recent utility bill, rental contract, or bank statement (within last 3 months) showing UAE address.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Bank Account Details | تفاصيل الحساب البنكي:</strong>
                        <p className="text-sm mt-1">UAE bank account in investor's name for investment transfers and return distributions. Bank letter or cancelled cheque.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Accredited Investor Qualification | مؤهلات المستثمر المعتمد:</strong>
                        <p className="text-sm mt-1">Documentation proving accredited investor status (if required by regulations):</p>
                        <ul className="ml-6 mt-2 space-y-1 text-sm">
                          <li>- Net worth statement (if threshold applies)</li>
                          <li>- Income verification (salary certificate, tax returns)</li>
                          <li>- Professional certification (CFA, CPA, etc.)</li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Institutional Investors */}
                <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">Institutional Investors | المستثمرون المؤسسيون</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Company Registration | سجل الشركة:</strong>
                        <p className="text-sm mt-1">Trade license, certificate of incorporation, memorandum of association.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Board Resolution | قرار مجلس الإدارة:</strong>
                        <p className="text-sm mt-1">Board resolution authorizing investment and naming authorized signatories.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Signatory Documents | وثائق المفوض بالتوقيع:</strong>
                        <p className="text-sm mt-1">Emirates ID, passport, and authorization letter for each authorized signatory.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Financial Statements | القوائم المالية:</strong>
                        <p className="text-sm mt-1">Latest audited financials of the investing entity.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* KYC/AML */}
                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">Additional KYC/AML Requirements | متطلبات إضافية</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li>• Source of funds declaration</li>
                    <li>• Beneficial ownership disclosure (for entities)</li>
                    <li>• Sanctions screening (automatic)</li>
                    <li>• PEP (Politically Exposed Person) declaration</li>
                    <li>• Investment suitability questionnaire</li>
                    <li>• Risk disclosure acknowledgment</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-green-500/20 rounded-lg p-4 border border-green-500/50">
                <p className="text-green-200 text-sm">
                  <strong>Investor Protection:</strong> All investors will be added to the on-chain InvestorWhitelist contract only after full KYC/AML verification. Minimum investment amounts and suitability requirements ensure appropriate investor participation.
                </p>
              </div>
            </section>

            {/* For Underwriters */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">⚖️</span>
                <h2 className="text-3xl font-bold text-white">For Underwriters</h2>
              </div>
              <p className="text-blue-200 mb-6" dir="rtl" lang="ar">
                للمكتتبين / مسؤولي الاعتماد
              </p>

              <div className="space-y-4">
                <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
                  <h3 className="text-xl font-semibold text-white mb-3">Professional Requirements:</h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Professional Qualifications:</strong>
                        <p className="text-sm mt-1">Background in banking, credit analysis, or risk management. Relevant certifications (CFA, FRM, CPA) preferred.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">UAE Work Authorization:</strong>
                        <p className="text-sm mt-1">Valid UAE work permit or visa allowing employment in financial services.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Background Verification:</strong>
                        <p className="text-sm mt-1">Criminal background check and employment reference verification.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-yellow-400 text-xl flex-shrink-0">✓</span>
                      <div>
                        <strong className="text-white">Conflict of Interest Declaration:</strong>
                        <p className="text-sm mt-1">Disclosure of any financial interests or relationships that could create conflicts.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-blue-300">
                  Underwriters are responsible for reviewing risk scores, validating documents, and making final approval decisions. All actions are logged in the audit trail.
                </p>
              </div>
            </section>

            {/* Document Security */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🔒</span>
                <h2 className="text-3xl font-bold text-white">Document Security & Privacy</h2>
              </div>
              <p className="text-blue-200 mb-6" dir="rtl" lang="ar">
                أمن الوثائق والخصوصية
              </p>

              <div className="space-y-4 text-blue-100">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                    <h3 className="text-lg font-semibold text-white mb-2">✅ How Documents Are Stored:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Encrypted storage (AES-256)</li>
                      <li>• Access control by role</li>
                      <li>• Audit log of all access</li>
                      <li>• Secure deletion after retention period</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <h3 className="text-lg font-semibold text-white mb-2">❌ What Goes On-Chain:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Document hash (SHA-256) only</li>
                      <li>• No raw documents</li>
                      <li>• No personal information</li>
                      <li>• No identifiable data</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/20 rounded-lg p-6 border border-blue-500/50">
                  <h3 className="text-lg font-semibold text-white mb-3">Privacy Compliance:</h3>
                  <ul className="space-y-2 text-sm">
                    <li><strong>UAE Data Protection Law:</strong> All personal data handling complies with UAE DPA requirements</li>
                    <li><strong>GDPR Principles:</strong> Data minimization, purpose limitation, right to access and deletion</li>
                    <li><strong>Retention Policy:</strong> Documents retained only as long as required by regulation (typically 7 years for financial records)</li>
                    <li><strong>Access Rights:</strong> You have the right to access, correct, or request deletion of your personal data</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/50">
                  <p className="text-yellow-200 text-sm">
                    <strong>🔒 Privacy Guarantee:</strong> AssetFi UAE will never store raw documents or personally identifiable information on the Stellar blockchain. Only cryptographic hashes are recorded on-chain for verification purposes. All PII remains in secure off-chain storage with strict access controls.
                  </p>
                </div>
              </div>
            </section>

            {/* Document Verification Process */}
            <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🔍</span>
                <h2 className="text-3xl font-bold text-white">Document Verification Process</h2>
              </div>
              <p className="text-blue-200 mb-6" dir="rtl" lang="ar">
                عملية التحقق من الوثائق
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div className="text-blue-100">
                    <h3 className="text-lg font-semibold text-white mb-1">Upload</h3>
                    <p className="text-sm">User uploads documents through secure portal. Files are scanned for viruses and validated for format/size.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div className="text-blue-100">
                    <h3 className="text-lg font-semibold text-white mb-1">Hash Generation</h3>
                    <p className="text-sm">System generates SHA-256 hash of document. This hash is recorded in the database and (in Phase 2) on Stellar blockchain.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div className="text-blue-100">
                    <h3 className="text-lg font-semibold text-white mb-1">AI Extraction (Phase 3)</h3>
                    <p className="text-sm">OCR extracts text from documents. AI parses structured data (license numbers, dates, amounts) for validation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <div className="text-blue-100">
                    <h3 className="text-lg font-semibold text-white mb-1">Manual Review</h3>
                    <p className="text-sm">Underwriter reviews documents, cross-checks extracted data, and verifies authenticity. May request additional documents.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                  <div className="text-blue-100">
                    <h3 className="text-lg font-semibold text-white mb-1">Approval/Rejection</h3>
                    <p className="text-sm">Underwriter marks documents as verified or rejected. Status is logged in audit trail and user is notified.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-500/30 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Questions About Documentation?</h2>
              <p className="text-blue-200 mb-6">
                This page is informational. Vartola is a working Alpha and is not accepting real documents or applications.
              </p>
              <p className="text-blue-200 mb-6" dir="rtl" lang="ar">
                هذه الصفحة معلوماتية. فارتولا منصة عاملة ضمن مرحلة ألفا ولا تقبل حالياً مستندات أو طلبات حقيقية.
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/whitepaper"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Read Whitepaper
                </Link>
                <Link 
                  href="/"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </section>

          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
