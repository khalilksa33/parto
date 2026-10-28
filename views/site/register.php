<?php

/** @var yii\web\View $this */
/** @var bool $isRtl */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'تسجيل الشركاء والبائعين ومحلات التشليح | بارتو السعودية' 
    : 'Vendor & Distributor Registration | PARTO Saudi Arabia';
?>

<div style="max-width: min(1200px, 94vw); width: 100%; margin: 2.5rem auto 5rem; padding: 0 1.5rem;">

  <!-- Hero Title -->
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <div class="hero-pill" style="margin-bottom: 1rem;">
      <span>🏪</span>
      <span><?= $isRtl ? 'بوابة شركاء منصة بارتو' : 'PARTO Partner Network' ?></span>
    </div>
    <h1 style="font-size: 2.3rem; font-weight: 900; color: #fff; margin-bottom: 0.8rem;">
      <?= $isRtl ? 'سجّل منشأتك وانطلق بمتجرك الإلكتروني فوراً' : 'Register Your Business & Launch Your Store' ?>
    </h1>
    <p style="color: var(--text-secondary); font-size: 1.05rem;">
      <?= $isRtl 
        ? 'انضم إلى أكبر تجمع لمحلات قطع الغيار، ساحات التشليح، سطحات السحب، وورش الصيانة بالمملكة العربية السعودية.' 
        : 'Connect with thousands of buyers across Saudi Arabia. Manage inventory, orders, and quote RFQ requests in real-time.' ?>
    </p>
  </div>

  <!-- Registration Card -->
  <div id="registerFormCard" class="search-card" style="padding: 2.5rem;">
    
    <form onsubmit="handleVendorRegister(event)">
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
        
        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'اسم المنشأة أو المحل التجاري' : 'Business / Store Name' ?> *</label>
          <input type="text" id="regName" class="form-control" required placeholder="<?= $isRtl ? 'مثال: شركة وادي أحد لقطع الغيار' : 'e.g. Apex Spare Parts' ?>">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'معرّف المتجر بالرابط (Subdomain Handle)' : 'Store Username / Handle' ?> *</label>
          <input type="text" id="regSubdomain" class="form-control" required placeholder="<?= $isRtl ? 'مثال: wadi-uhud (أحرف إنجليزية وأرقام)' : 'e.g. apex-parts (letters, numbers, dashes)' ?>">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'اسم المالك أو الشخص المسؤول' : 'Owner / Manager Name' ?> *</label>
          <input type="text" id="regOwner" class="form-control" required placeholder="<?= $isRtl ? 'مثال: المهندس مهند عبدالرحمن' : 'e.g. Eng. Mohaned' ?>">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'رقم الجوال للتواصل والطلبات' : 'Mobile Phone Number' ?> *</label>
          <input type="tel" id="regPhone" class="form-control" required placeholder="05xxxxxxxx">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'البريد الإلكتروني الرسمي' : 'Official Email Address' ?> *</label>
          <input type="email" id="regEmail" class="form-control" required placeholder="contact@domain.sa">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'نوع النشاط التجاري' : 'Business Domain Type' ?> *</label>
          <select id="regBusinessType" class="form-control" onchange="updateCommissionNotice()">
            <option value="new_auto_spare_parts"><?= $isRtl ? 'بائع قطع غيار جديدة (New Auto Spare Parts) - عمولة 8%' : 'New Auto Spare Parts Seller - 8% Fee' ?></option>
            <option value="used_auto_spare_parts"><?= $isRtl ? 'تشليح وسكراب قطع مستعملة (Tashleeh) - عمولة 10%' : 'Used Auto Parts / Tashleeh - 10% Fee' ?></option>
            <option value="tow_company"><?= $isRtl ? 'شركة سطحات ونقل سيارات (Towing) - عمولة 12%' : 'Flatbed Tow Company - 12% Fee' ?></option>
            <option value="mobile_workshop"><?= $isRtl ? 'ورشة صيانة متنقلة (Mobile Workshop) - عمولة 12%' : 'Mobile Automobile Workshop - 12% Fee' ?></option>
            <option value="digital_alignment"><?= $isRtl ? 'ميزان إلكتروني وضبط زوايا (Wheel Alignment) - عمولة 10%' : 'Digital Wheel Alignment - 10% Fee' ?></option>
            <option value="mechanics_workshop"><?= $isRtl ? 'ورشة صيانة وميكانيكا (Mechanics Workshop) - عمولة 10%' : 'Mechanics Workshop - 10% Fee' ?></option>
          </select>
        </div>

      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'عنوان المستودع أو موقع المحل الفعلي' : 'Warehouse / Shop Street Address' ?></label>
        <input type="text" id="regAddress" class="form-control" placeholder="<?= $isRtl ? 'الرياض - صناعية الشفاء - شارع المعارض' : 'Riyadh - Al-Shifa Industrial Zone' ?>">
      </div>

      <!-- Emoji Logo Selection -->
      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'اختر رمز المتجر (Emoji Logo)' : 'Select Storefront Icon' ?></label>
        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;" id="logoPicker">
          <?php foreach (['⚙️', '🚗', '🛻', '🏎️', '🔧', '🛠️', '🔋', '📐', '🏪', '⚡'] as $i => $emoji): ?>
            <label style="border: 1px solid var(--border-dark); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 1.4rem; cursor: pointer; background: rgba(255,255,255,0.04);">
              <input type="radio" name="storeLogo" value="<?= $emoji ?>" <?= $i === 0 ? 'checked' : '' ?> style="display: none;" onchange="highlightLogo(this)">
              <span><?= $emoji ?></span>
            </label>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Commission Disclosure Notice -->
      <div id="commissionNoticeBox" style="background: rgba(37,99,235,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-lg); padding: 1.15rem; margin-bottom: 1.5rem;">
        <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">
          💼 <?= $isRtl ? 'شروط الشراكة والعمولة' : 'Platform Partnership Terms' ?>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">
          <?= $isRtl 
            ? 'نسبة عمولة منصة بارتو لهذا النشاط هي <span id="commRateText" style="color: #38bdf8; font-weight: 800;">8%</span> فقط من إجمالي المبيعات المنفذة بنجاح. لا توجد أي رسوم اشتراك شهرية أو رسوم تسجيل مسبقة.' 
            : 'Platform commission for this business category is <span id="commRateText" style="color: #38bdf8; font-weight: 800;">8%</span> on completed orders only. Zero setup fees or monthly subscriptions.' ?>
        </p>
      </div>

      <div class="form-group" style="display: flex; align-items: center; gap: 0.65rem;">
        <input type="checkbox" id="regTerms" required style="width: 18px; height: 18px;">
        <label for="regTerms" style="font-size: 0.88rem; color: var(--text-secondary); cursor: pointer;">
          <?= $isRtl ? 'أوافق على اتفاقية التجارة الإلكترونية وشروط عمولة بارتو وأتعهد بضمان جودة القطع المعروضة.' : 'I agree to the partnership terms, commission schedule, and quality assurance agreement.' ?>
        </label>
      </div>

      <button type="submit" id="regSubmitBtn" class="btn-primary" style="width: 100%; padding: 1.1rem; font-size: 1.05rem;">
        <span><?= $isRtl ? 'إطلاق المتجر وتفعيل المساحة الخاصة' : 'Launch My Store & Activate Space' ?></span>
        <span>🚀</span>
      </button>

    </form>
  </div>

  <!-- Success Card -->
  <div id="registerSuccessCard" class="search-card" style="display: none; padding: 3rem 2rem; text-align: center;">
    <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎉</div>
    <h2 style="font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem;">
      <?= $isRtl ? 'تم تسجيل متجرك بنجاح!' : 'Your Store Is Live!' ?>
    </h2>
    <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 2rem;">
      <?= $isRtl 
        ? 'تم إنشاء مساحة المستأجر الخاصة بك وقاعدة البيانات بنجاح في منصة بارتو (Yii 2).' 
        : 'Your isolated tenant database has been provisioned on PARTO (Yii 2).' ?>
    </p>

    <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem; text-align: right;">
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.35rem;"><?= $isRtl ? 'معرّف المستأجر الخاص بك (Tenant ID):' : 'Your Tenant ID:' ?></div>
      <div id="generatedTenantId" style="font-family: monospace; font-size: 1.25rem; font-weight: 900; color: #38bdf8; word-break: break-all; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px dashed var(--border-highlight);"></div>
      <button class="btn-primary" style="margin-top: 0.75rem; padding: 0.4rem 0.85rem; font-size: 0.8rem;" onclick="copyTenantId()">
        📋 <?= $isRtl ? 'نسخ المفتاح' : 'Copy Key' ?>
      </button>
    </div>

    <a id="goToPortalBtn" href="<?= Url::to(['/portal/index']) ?>" class="btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem; display: inline-flex;">
      <span><?= $isRtl ? 'الانتقال إلى لوحة تحكم المتجر' : 'Go to Vendor Dashboard' ?></span>
      <span><?= $isRtl ? '←' : '→' ?></span>
    </a>
  </div>

</div>

<script>
function highlightLogo(radio) {
  document.querySelectorAll('#logoPicker label').forEach(lbl => {
    lbl.style.borderColor = 'var(--border-dark)';
    lbl.style.background = 'rgba(255,255,255,0.04)';
  });
  radio.parentElement.style.borderColor = 'var(--primary)';
  radio.parentElement.style.background = 'rgba(37,99,235,0.2)';
}

function updateCommissionNotice() {
  const type = document.getElementById('regBusinessType').value;
  const rates = {
    'new_auto_spare_parts': '8%',
    'used_auto_spare_parts': '10%',
    'tow_company': '12%',
    'mobile_workshop': '12%',
    'digital_alignment': '10%',
    'mechanics_workshop': '10%'
  };
  document.getElementById('commRateText').textContent = rates[type] || '8%';
}

async function handleVendorRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('regSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span><?= $isRtl ? "جاري تهيئة المتجر وقاعدة البيانات..." : "Provisioning store database..." ?></span>';

  const logoRadio = document.querySelector('input[name="storeLogo"]:checked');

  const payload = {
    name: document.getElementById('regName').value.trim(),
    subdomain: document.getElementById('regSubdomain').value.trim(),
    ownerName: document.getElementById('regOwner').value.trim(),
    phone: document.getElementById('regPhone').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    businessType: document.getElementById('regBusinessType').value,
    warehouseAddress: document.getElementById('regAddress').value.trim(),
    logo: logoRadio ? logoRadio.value : '⚙️'
  };

  try {
    const res = await fetch('api/tenants.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await res.json();

    if (!res.ok || !d.success) throw new Error(d.error || 'Failed to register vendor');

    document.getElementById('registerFormCard').style.display = 'none';
    document.getElementById('registerSuccessCard').style.display = 'block';
    document.getElementById('generatedTenantId').textContent = d.tenant.id;
    document.getElementById('goToPortalBtn').href = `<?= Url::to(['/portal/index']) ?>?tenantId=${encodeURIComponent(d.tenant.id)}`;
    
    localStorage.setItem('parto_vendor_tenant_id', d.tenant.id);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span><?= $isRtl ? "إطلاق المتجر وتفعيل المساحة الخاصة" : "Launch My Store" ?></span><span>🚀</span>';
  }
}

function copyTenantId() {
  const id = document.getElementById('generatedTenantId').textContent;
  navigator.clipboard.writeText(id).then(() => {
    Parto.showToast('<?= $isRtl ? "تم نسخ معرّف المتجر بنجاح!" : "Store ID copied successfully!" ?>');
  });
}
</script>
