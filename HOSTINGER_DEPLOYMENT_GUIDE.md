# دليل نشر وتشغيل منصة PARTO على استضافة Hostinger
# Hostinger CI/CD Auto-Deployment Guide (parto.dynapulsar.com)

تم تحويل منصة **بارتو (PARTO)** بالكامل وبأعلى كفاءة إلى **PHP 8+, HTML5, CSS3, و Vanilla JavaScript**، لتتوافق بنسبة 100% وبدون أي تعقيد مع سيرفرات وخوادم استضافة **Hostinger** المشتركة والسحابية (LiteSpeed / Apache) وتعمل بشكل فوري وسريع للغاية دون الحاجة لتشغيل خدمات Node.js أو Docker المعقدة.

---

## 🚀 خطة النشر الآلي عبر GitHub Actions (CI/CD Pipeline)

الملف المسؤول عن النشر التلقائي موجود في مسار:
`.github/workflows/hostinger-deploy.yml`

عند تنفيذ أي أمر `git push origin main`، يقوم الـ Pipeline بالآتي:
1. فحص واختبار سلامة أكواد PHP والتأكد من خلوها من أي أخطاء برمجية (`php -l`).
2. الاتصال الآمن بسيرفر Hostinger الخاص بك عبر بروتوكول **FTPS المشفر**.
3. نقل ومزامنة الملفات المحولة مباشرة إلى مجلد النطاق الفرعي `parto.dynapulsar.com`.
4. عمل فحص استجابة حي (Ping Health Check) للموقع.

---

## 🔑 الخطوة 1: ضبط أسرار GitHub (GitHub Repository Secrets)

توجه إلى مستودعك على GitHub:
`https://github.com/khalilksa33/parto/settings/secrets/actions`

واضغط على **New repository secret** وأضف المتغيرات الثلاثة التالية المستخرجة من لوحة تحكم Hostinger (hPanel):

| اسم السر (Secret Name) | القيمة المطلوبة (Value) | أين تجدها في Hostinger؟ |
|---|---|---|
| `HOSTINGER_FTP_SERVER` | عنوان خادم الـ FTP (مثال: `ftp.dynapulsar.com` أو IP السيرفر) | في لوحة Hostinger: **Files -> FTP Accounts** |
| `HOSTINGER_FTP_USERNAME` | اسم مستخدم الـ FTP (مثال: `u123456789` أو الحساب المخصص) | في لوحة Hostinger: **Files -> FTP Accounts** |
| `HOSTINGER_FTP_PASSWORD` | كلمة مرور حساب الـ FTP | كلمة المرور التي اخترتها للحساب |
| `HOSTINGER_REMOTE_DIR` *(اختياري)* | مسار مجلد النطاق في السيرفر (مثال: `domains/dynapulsar.com/public_html/parto/` أو `public_html/parto/` أو `public_html/`) | مسار المجلد المخصص للنطاق الفرعي |

---

## 🌐 الخطوة 2: تهيئة النطاق الفرعي في لوحة Hostinger (hPanel)

1. سجل الدخول إلى **Hostinger hPanel**.
2. اختر نطاقك الرئيسي `dynapulsar.com`.
3. انتقل إلى **Domains -> Subdomains**.
4. في خانة Subdomain اكتب: `parto` (ليصبح النطاق `parto.dynapulsar.com`).
5. ستقوم Hostinger تلقائياً بإنشاء مجلد مثل `domains/dynapulsar.com/public_html/parto` أو `public_html/parto`.
6. تأكد من تطابق هذا المسار مع قيمة `HOSTINGER_REMOTE_DIR` في GitHub Secrets.

---

## 🗄️ الخطوة 3: قاعدة البيانات (Database Setup)

المنصة مصممة بتقنية **Fail-Safe Zero-Config Dual Engine**:
- **الوضع الافتراضي الفوري**: إذا لم تقم بإنشاء قاعدة بيانات MySQL بعد، ستعمل المنصة تلقائياً على قاعدة بيانات **SQLite** مدمجة ومجهزة بكافة البيانات الأولية بدون أي توقف أو أخطاء.
- **تفعيل MySQL في Hostinger (موصى به للإنتاج)**:
  1. في hPanel اذهب إلى **Databases -> Management**.
  2. أنشئ قاعدة بيانات جديدة باسم `parto`، وأنشئ مستخدم وكلمة مرور.
  3. افتح **phpMyAdmin** واضغط على تبويب **Import** وارفع ملف:
     `config/schema.sql`
  4. لربطها، يمكنك إنشاء ملف `.env` في السيرفر أو إضافة المتغيرات:
     ```env
     DB_HOST=127.0.0.1
     DB_NAME=اسم_قاعدة_البيانات
     DB_USER=اسم_المستخدم
     DB_PASS=كلمة_المرور
     GEMINI_API_KEY=مفتاح_جيميني_للذكاء_الاصطناعي
     ```

---

## 🧪 صفحات ومسارات المنصة الجاهزة للاستخدام:

- **الرئيسية وسوق قطع الغيار والـ VIN**: `https://parto.dynapulsar.com/` أو `index.php`
- **مركز طلب قطع التشليح والسكراب (RFQ)**: `https://parto.dynapulsar.com/tashleeh.php`
- **خدمات السطحات وسحب السيارات الفوري 24/7**: `https://parto.dynapulsar.com/towing.php`
- **حجز الورش والميكانيكي المتنقل والميزان الإلكتروني**: `https://parto.dynapulsar.com/workshop.php`
- **كتالوج الوكالة ومطابقة الأرقام الأصلية OEM**: `https://parto.dynapulsar.com/oem.php`
- **سلة الشراء وإتمام الدفع (مدى، أبل باي، كاش)**: `https://parto.dynapulsar.com/checkout.php`
- **لوحة تحكم البائع والتاجر (إدارة المخزون، الطلبات، التسعير)**: `https://parto.dynapulsar.com/portal.php`
- **لوحة تحكم المشرف العام للمنظومة**: `https://parto.dynapulsar.com/admin.php`
- **تسجيل منشأة أو تشليح جديد**: `https://parto.dynapulsar.com/register.php`
- **المساعد الذكي (بارتو AI)**: زر عائم تفاعلي في كافة الصفحات لتشخيص الأعطال وتوجيه العميل للقطع المناسبة.
