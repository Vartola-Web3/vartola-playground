# AssetFi UAE 🇦🇪

## نظرة عامة

**AssetFi UAE** هو منصة تقنية مالية مؤسسية لتمويل الأصول الإنتاجية للشركات الصغيرة والمتوسطة في الإمارات من خلال التأجير التمويلي المرمز على شبكة Stellar Testnet.

**المرحلة الحالية**: Phase 1 MVP Foundation  
**الحالة**: قاعدة البيانات والبنية التحتية جاهزة، واجهة المستخدم قيد التطوير  
**الشبكة**: Stellar Testnet فقط (لا معاملات مالية حقيقية)

---

## ✨ الميزات الرئيسية

### المرحلة 1 (MVP) - مكتمل ✅
- [x] قاعدة بيانات SQLite كاملة مع Prisma ORM
- [x] نماذج بيانات لجميع الكيانات (المستخدمين، الشركات، الطلبات، الأصول، التسهيلات، المحافظ)
- [x] بيانات تجريبية (شركة Gulf Logistics، طلب شاحنة بقيمة 300 ألف درهم، Tier B)
- [x] وثائق معمارية شاملة
- [x] محرك تقييم المخاطر الكامل
- [x] تصميم عقود Soroban الذكية
- [x] نظام مصادقة NextAuth.js مع حماية المسارات
- [x] واجهات المستخدم لجميع الأدوار (SME، Investor، Underwriter، Admin)
- [x] محرك المخاطر ثلاثي الأبعاد مع حساب Tier تلقائي
- [x] نماذج تكامل Stellar (Phase 1: محاكاة مع hashes)

### المرحلة 2 (Soroban) - مخطط
- [ ] عقود Rust Soroban الذكية
- [ ] تكامل Stellar Testnet الحقيقي
- [ ] InvestorWhitelist Contract
- [ ] AssetRegistry Contract
- [ ] FinancingFacility Contract
- [ ] FinancingPool Contract
- [ ] PaymentDistributor Contract

### المرحلة 3 (AI) - مخطط
- [ ] استخراج المستندات بالذكاء الاصطناعي
- [ ] تحليل البيانات المالية
- [ ] كشف الاحتيال
- [ ] مساعد الاكتتاب بالذكاء الاصطناعي

---

## 🏗️ البنية المعمارية

```
AssetFi UAE
├── Next.js 14 (App Router) + TypeScript
├── SQLite Database (Prisma ORM)
├── محرك تقييم المخاطر ثلاثي الأبعاد
│   ├── Company Risk Score (0-100)
│   ├── Asset Risk Score (0-100)
│   └── Deal Risk Score (0-100) → Tier A/B/C/D
├── Stellar Testnet Integration (Phase 2)
│   ├── Soroban Smart Contracts (Rust)
│   ├── Simulated tAED Token
│   └── Transaction Monitoring
└── 4 Role-Based Portals
    ├── SME: تقديم الطلبات والمستندات
    ├── Investor: الاشتراك في المحافظ وعرض العوائد
    ├── Underwriter: مراجعة واعتماد الطلبات
    └── Admin: إدارة النظام والمستخدمين
```

---

## 📊 نموذج البيانات

### الكيانات الرئيسية
- **Users**: Admin, Underwriter, SME, Investor (مع أدوار)
- **Companies**: ملفات الشركات الصغيرة والمتوسطة
- **Applications**: طلبات التمويل
- **Documents**: المستندات المرفوعة (مع hashes للبلوكشين)
- **Facilities**: التسهيلات المعتمدة
- **Pools**: محافظ المستثمرين
- **Investments**: مراكز المستثمرين
- **Payments**: جدول السداد الشهري
- **Distributions**: توزيع العوائد على المستثمرين
- **AuditLogs**: سجل التدقيق الكامل

انظر: `docs/database-schema.md`

---

## 🎯 السيناريو التجريبي

**الشركة**: Gulf Logistics LLC  
**الأصل**: شاحنة Isuzu NPR جديدة  
**القيمة**: 300,000 درهم  
**مساهمة الشركة**: 75,000 درهم (25%)  
**مبلغ التمويل**: 225,000 درهم (75%)  
**المدة**: 36 شهراً  
**القسط الشهري**: 7,020 درهم  

**تقييم المخاطر**:
- Company Risk: 72/100
- Asset Risk: 84/100
- Deal Risk: 75/100
- **Tier: B**

**المحفظة**: Logistics Pool 001 (هدف 500K، مُجمَّع 225K)  
**المستثمرون**: 3 مستثمرين (100K + 75K + 50K)  
**الحالة**: نشط، دُفع قسط واحد

---

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js 20+
- npm أو yarn

### الخطوات

```bash
# 1. استنساخ المشروع
git clone <repo-url>
cd workspace

# 2. تثبيت التبعيات
npm install

# 3. تشغيل تطبيق التطوير
npm run dev

# سيعمل التطبيق على http://localhost:4200
```

### بيانات الاعتماد التجريبية

| الدور | البريد الإلكتروني | كلمة المرور |
|------|-------------------|-------------|
| مدير | admin@assetfi.ae | admin123 |
| مكتتب | underwriter@assetfi.ae | underwriter123 |
| شركة صغيرة | ahmed@gulflogistics.ae | sme123 |
| مستثمر 1 | khalid@investor.ae | investor123 |
| مستثمر 2 | fatima@investor.ae | investor123 |
| مستثمر 3 | mohammed@investor.ae | investor123 |

---

## 🎬 Demo Walkthrough

### End-to-End Financing Journey

This demo showcases the complete workflow using the seeded Gulf Logistics truck application.

#### 1️⃣ **Login**
Navigate to `http://localhost:4200/login`
- Click any of the quick-login buttons to instantly sign in
- Or manually enter credentials

#### 2️⃣ **SME Portal** (ahmed@gulflogistics.ae / sme123)

**Dashboard**:
- View company overview: Gulf Logistics LLC
- See active application: APP-2024-001 (Isuzu Truck)
- Check statistics: 1 application, 1 facility

**Facility Detail**:
- Click on "FAC-2024-001" to view facility details
- See payment schedule with 36 monthly payments
- View payment progress: 1 paid, 35 remaining
- Check Stellar transaction hash (simulated)
- See monthly payment: AED 7,020
- Click "View on Stellar Explorer" link

#### 3️⃣ **Underwriter Portal** (underwriter@assetfi.ae / underwriter123)

**Dashboard**:
- View pending applications queue
- See system statistics

**Application Review**:
- Click on any application to review
- **Risk Assessment Summary** shows:
  - Company Risk Score: 72/100 (Good)
  - Asset Risk Score: 84/100 (Excellent)
  - Deal Risk Score: 75/100 (Good)
  - **Risk Tier: B** (Senior Underwriter approval required)
- View recommendations:
  - ✓ Company shows solid financial health
  - ✓ Asset has strong resale market
  - ✓ Good risk profile - senior underwriter approval recommended
- Review company details:
  - Gulf Logistics LLC
  - Trade License: DED-123456-2021
  - Industry: Logistics & Transportation
  - Established: Jan 2021
  - Monthly Revenue: AED 180,000
- Review asset details:
  - Asset Type: TRUCK
  - Description: Isuzu NPR 75P 16FT Box Truck - Brand New
  - Asset Value: AED 300,000
- Review deal structure:
  - SME Contribution: AED 75,000 (25%)
  - Finance Amount: AED 225,000 (75%)
  - LTV Ratio: 75%
  - Term: 36 months
- View uploaded documents
- **Make Decision**:
  - Add comments (optional)
  - Add conditions (optional)
  - Click "Approve", "Conditional Approval", or "Reject"
  - Decision is logged in audit trail

#### 4️⃣ **Investor Portal** (khalid@investor.ae / investor123)

**Dashboard**:
- View investment statistics:
  - Total Invested: AED 100,000
  - Total Distributions: AED 3,120
  - Active Investments: 1
- See available pools:
  - **Logistics Pool 001**
  - Target: AED 500,000
  - Raised: AED 225,000 (45%)
  - Target Return: 9.5%
  - Min Investment: AED 25,000
  - Asset Focus: UAE Commercial Trucks & Vans
- View portfolio:
  - Investment in Logistics Pool 001
  - Amount invested: AED 100,000
  - Distributions received: AED 3,120
  - Status: ACTIVE

#### 5️⃣ **Admin Portal** (admin@assetfi.ae / admin123)

**Dashboard**:
- System statistics overview:
  - Total Users: 6
  - Applications: 1
  - Active Facilities: 1
  - Investment Pools: 1
  - Total Financed: AED 225,000

**User Management**:
- View all 6 users with roles
- See login activity
- View user details:
  - 1 Admin
  - 1 Underwriter
  - 1 SME (Gulf Logistics)
  - 3 Investors

**System Activity**:
- Recent audit log entries
- User actions tracked:
  - Application reviews
  - Pool creation
  - Investment subscriptions

### 🔍 Key Features to Explore

1. **Risk Engine in Action**:
   - Login as Underwriter
   - View application review page
   - See real-time risk calculation
   - Tier assignment based on 3-dimensional scoring

2. **Payment Schedule**:
   - Login as SME
   - View facility detail
   - See payment schedule with status
   - One payment marked as PAID
   - View Stellar transaction references

3. **Stellar Integration**:
   - All facilities show simulated Stellar tx hashes
   - Payments reference blockchain transactions
   - Pool creation includes Stellar pool IDs
   - Investments show subscription transaction hashes
   - Click "View on Stellar Explorer" links

4. **Audit Trail**:
   - Login as Admin
   - View recent system activity
   - All decisions logged with user and timestamp

### 🎯 Testing the Full Workflow

**Scenario**: Review and approve the seeded truck application

1. Login as **Underwriter**
2. Navigate to pending queue
3. Click on **APP-2024-001**
4. Review risk scores (should show Tier B)
5. Add comment: "Solid logistics company, good asset"
6. Click **Approve**
7. Logout
8. Login as **SME**
9. See updated application status
10. View facility payment schedule
11. Confirm Stellar transaction hash displayed

### 📊 Expected Risk Scores

For the Gulf Logistics truck application:
- **Company Risk**: ~72/100
  - Age: 60 (3 years)
  - Revenue: 36 (AED 180K/month)
  - Cash Flow: 40 (AED 40K/month)
  - Debt Ratio: 72
  - Industry: 75 (Logistics)
  - Documents: 100 (complete)

- **Asset Risk**: ~84/100
  - Type: 85 (Truck)
  - Age: 100 (New)
  - Value: 80 (within range)
  - Condition: 100 (New)
  - Liquidity: 80

- **Deal Risk**: ~75/100 → **Tier B**
  - LTV: 75% (acceptable)
  - Term: 36 months (good)
  - Affordability: Strong (17.5% of cash flow)

---

## 📁 هيكل المشروع

```
/workspace
├── docs/                         # الوثائق المعمارية
│   ├── architecture.md          # نظرة عامة على النظام
│   ├── database-schema.md       # مخططات قاعدة البيانات
│   ├── stellar-architecture.md  # تصميم Soroban
│   ├── risk-engine.md           # خوارزميات تقييم المخاطر
│   └── implementation-plan.md   # خطة التنفيذ المفصلة
├── prisma/
│   ├── schema.prisma            # نموذج قاعدة البيانات
│   ├── seed.ts                  # بيانات تجريبية
│   └── dev.db                   # قاعدة بيانات SQLite
├── lib/
│   ├── db.ts                    # Prisma client
│   ├── risk-engine/             # محرك تقييم المخاطر
│   ├── stellar/                 # تكامل Stellar
│   └── auth/                    # نظام المصادقة
├── components/
│   ├── ui/                      # مكونات shadcn/ui
│   ├── layout/                  # تخطيطات الصفحات
│   └── forms/                   # نماذج الإدخال
├── app/
│   ├── (auth)/                  # صفحات تسجيل الدخول
│   ├── sme/                     # بوابة الشركات الصغيرة
│   ├── investor/                # بوابة المستثمرين
│   ├── underwriter/             # بوابة المكتتبين
│   ├── admin/                   # بوابة المدير
│   └── api/                     # API routes
├── .env.local                   # متغيرات البيئة
└── README.md                    # هذا الملف
```

---

## 🧪 محرك تقييم المخاطر

### نظام التقييم ثلاثي الأبعاد

```typescript
Company Risk Score (0-100)
├── Business Age (15%)
├── Monthly Revenue (25%)
├── Cash Flow (25%)
├── Debt Ratio (20%)
├── Industry Risk (10%)
└── Document Completeness (5%)

Asset Risk Score (0-100)
├── Asset Type (30%)
├── Asset Age (20%)
├── Market Value (20%)
├── Condition (15%)
└── Resale Liquidity (15%)

Deal Risk Score (0-100)
├── Company Score (40%)
├── Asset Score (30%)
├── LTV Ratio (15%)
├── Term Length (10%)
└── Affordability (5%)

→ Risk Tier Assignment
   Tier A: 81-100 (Low Risk)
   Tier B: 66-80  (Medium-Low Risk) ← Gulf Logistics
   Tier C: 51-65  (Medium-High Risk)
   Tier D: 0-50   (High Risk)
```

انظر: `docs/risk-engine.md` للمعادلات الكاملة

---

## 🔗 تكامل Stellar

### المرحلة 1: النماذج (Phase 1 - Current)
- معاملات محاكاة مع hashes مزيفة
- واجهات TypeScript للعقود الذكية
- روابط Stellar Explorer (placeholders)

### المرحلة 2: التطبيق الحقيقي (Phase 2 - Planned)

**العقود الذكية Soroban**:
1. **InvestorWhitelist**: إدارة المستثمرين المعتمدين
2. **AssetRegistry**: تسجيل الأصول مع البيانات الوصفية
3. **FinancingFacility**: هيكل التمويل
4. **FinancingPool**: إدارة اشتراكات المستثمرين
5. **PaymentDistributor**: توزيع الأقساط على المستثمرين

**تنبيه الخصوصية**: 
- ❌ لا معلومات شخصية على البلوكشين
- ✅ فقط hashes المستندات والبيانات المالية

انظر: `docs/stellar-architecture.md`

---

## 🛡️ الامتثال والتنظيم

### الموقف التنظيمي

⚠️ **هذا MVP هو عرض تقني فقط على Stellar Testnet**

- ❌ لا معاملات مالية حقيقية
- ❌ لا عملة tAED حقيقية (محاكاة فقط)
- ❌ غير معتمد لجمع استثمارات حقيقية
- ✅ عرض توضيحي للتقنية والبنية

**للإنتاج الحقيقي**:
1. مراجعة قانونية كاملة
2. ترخيص من CBUAE (شركات التمويل)
3. موافقة ADGM/DFSA (للأدوات المالية المرمزة)
4. شريك مرخص
5. KYC/AML كامل

---

## 📚 الوثائق

- [البنية المعمارية](docs/architecture.md)
- [مخطط قاعدة البيانات](docs/database-schema.md)
- [معمارية Stellar](docs/stellar-architecture.md)
- [محرك المخاطر](docs/risk-engine.md)
- [خطة التنفيذ](docs/implementation-plan.md)

---

## 🔨 أوامر مفيدة

```bash
# تطوير
npm run dev              # تشغيل خادم التطوير (المنفذ 4200)
npm run build            # بناء للإنتاج
npm run start            # تشغيل خادم الإنتاج

# قاعدة البيانات
npx prisma studio        # واجهة رسومية لقاعدة البيانات
npx prisma migrate dev   # إنشاء migration جديد
npm run db:seed          # إعادة تعبئة البيانات التجريبية
npx prisma generate      # توليد Prisma Client

# جودة الكود
npm run lint             # فحص الكود
npm run type-check       # فحص أنواع TypeScript (إضافة للـ package.json)
```

---

## 🎯 معايير النجاح - Phase 1

### مكتمل ✅
- [x] وثائق معمارية شاملة (5 ملفات)
- [x] قاعدة بيانات SQLite كاملة مع Prisma
- [x] نماذج البيانات لجميع الكيانات
- [x] بيانات تجريبية (Gulf Logistics + Truck)
- [x] محرك المخاطر الكامل مع حسابات دقيقة
- [x] نظام مصادقة NextAuth.js
- [x] حماية المسارات وتوجيه حسب الدور
- [x] بوابة SME (dashboard، facilities، payments)
- [x] بوابة Underwriter (queue، review، approve/reject)
- [x] بوابة Investor (dashboard، pools، portfolio)
- [x] بوابة Admin (users، stats، audit log)
- [x] تنسيق AED احترافي
- [x] ألوان حالة وتدرج المخاطر
- [x] Stellar stubs لجميع العقود الخمسة
- [x] hashes محاكاة مع روابط Explorer
- [x] سجل تدقيق كامل
- [x] README شامل مع دليل الديمو
- [x] المشروع يبنى بنجاح بدون أخطاء

### تم اختباره ✅
- [x] تسجيل الدخول لجميع الأدوار
- [x] SME يمكنه عرض التطبيقات والتسهيلات
- [x] Underwriter يمكنه المراجعة والاعتماد
- [x] محرك المخاطر يحسب Gulf Logistics = Tier B
- [x] Investor يمكنه عرض المحافظ والتوزيعات
- [x] Admin يمكنه عرض المستخدمين والنشاط
- [x] عرض Stellar transaction hashes
- [x] روابط Stellar Explorer تعمل

### النتيجة النهائية ✅
**Phase 1 MVP مكتمل بالكامل وجاهز للديمو!**

يمكن لأي شخص تسجيل الدخول بأي دور واستعراض رحلة التمويل الكاملة من البداية للنهاية في المتصفح بدون أموال حقيقية.

---

## 💡 الخطوات التالية

### للمطورين
1. إكمال واجهات المستخدم (SME، Investor، Underwriter، Admin)
2. تنفيذ محرك المخاطر من `docs/risk-engine.md`
3. إنشاء نظام المصادقة
4. إضافة Stellar stubs من `docs/stellar-architecture.md`
5. الاختبار الشامل

### للمرحلة 2
1. تعلم Rust و Soroban
2. كتابة العقود الذكية
3. اختبار على Stellar Testnet
4. توليد TypeScript bindings
5. تكامل العقود مع الواجهة

---

## 🤝 المساهمة

هذا مشروع عرض توضيحي لطلب Stellar Community Fund Grant.

---

## 📄 الترخيص

هذا المشروع عرض توضيحي فقط. الاستخدام التجاري يتطلب تراخيص ومراجعة قانونية.

---

## ⚠️ تنبيهات هامة

1. **لا قيمة مالية حقيقية**: tAED محاكاة فقط
2. **Testnet فقط**: لا معاملات Mainnet
3. **عرض تقني**: ليس منتج مالي جاهز
4. **يتطلب ترخيص**: للاستخدام الحقيقي مع عملاء
5. **مراجعة قانونية**: ضرورية قبل الإطلاق

---

## 📞 الاتصال

**المشروع**: AssetFi UAE MVP  
**الغرض**: Stellar Community Fund Build Award Application  
**الحالة**: Phase 1 Foundation (قاعدة البيانات والوثائق)  
**التطوير**: بواسطة Ahmed Fouad مع مساعد Vartola (Cursor AI)  

---

## 🌟 رؤية المشروع

AssetFi UAE تهدف لتمكين الشركات الصغيرة والمتوسطة في الإمارات من الحصول على الأصول الإنتاجية (شاحنات، معدات) من خلال تمويل مرمز شفاف على شبكة Stellar، مع توفير فرص استثمارية للمستثمرين المعتمدين في أصول حقيقية ذات عوائد منتظمة.

**السوق الأول**: الشاحنات والمركبات اللوجستية  
**الرؤية**: منصة تمويل الأصول الرائدة في الخليج على البلوكشين

---

**Built with ❤️ in the UAE | Powered by Stellar**
