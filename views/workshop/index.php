<?php

/** @var yii\web\View $this */
/** @var bool $isRtl */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'ورش صيانة السيارات والورش المتنقلة | بارتو السعودية' 
    : 'Auto Repair Workshops & Mobile Mechanics | PARTO Saudi Arabia';
?>

<div style="max-width: min(1760px, 96vw); width: 100%; margin: 2rem auto 4rem; padding: 0 1.5rem;">

  <!-- Hero Banner -->
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <div class="hero-pill" style="margin-bottom: 1rem;">
      <span>🔧</span>
      <span><?= $isRtl ? 'صيانة معتمدة وضمان ذهبي' : 'Certified Auto Repair & Mobile Mechanics' ?></span>
    </div>
    <h1 style="font-size: 2.4rem; font-weight: 900; color: #fff; margin-bottom: 0.8rem;">
      <?= $isRtl ? 'حجز ورشة صيانة أو ميكانيكي متنقل' : 'Book a Workshop or Mobile Mechanic' ?>
    </h1>
    <p style="color: var(--text-secondary); font-size: 1.05rem; max-width: 680px; margin: 0 auto;">
      <?= $isRtl 
        ? 'سواء كنت بحاجة لورشة متنقلة تصلك لموقعك، أو حجز موعد في أفضل الورش الصناعية المعتمدة لفحص المحرك والميزان الإلكتروني.' 
        : 'Book mobile on-site mechanics or schedule repairs at certified high-end workshops with computer diagnostics.' ?>
    </p>
  </div>

  <!-- Services Grid -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 3rem;">
    
    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem; text-align: center;">
      <div style="font-size: 2.8rem; margin-bottom: 0.75rem;">🔋</div>
      <h3 style="font-weight: 800; color: #fff; font-size: 1.15rem;"><?= $isRtl ? 'ورشة متنقلة واشتراك' : 'Mobile Battery & Jumpstart' ?></h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 1rem;"><?= $isRtl ? 'تصلك الورشة لموقعك لفحص البطارية واستبدالها وإصلاح الإطارات.' : 'On-site mobile mechanics for quick jumpstarts and battery replacements.' ?></p>
      <button class="btn-primary" style="margin: 0 auto; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="prefillService('Mobile Workshop')">
        <?= $isRtl ? 'طلب خدمة متنقلة' : 'Request Mobile' ?>
      </button>
    </div>

    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem; text-align: center;">
      <div style="font-size: 2.8rem; margin-bottom: 0.75rem;">📐</div>
      <h3 style="font-weight: 800; color: #fff; font-size: 1.15rem;"><?= $isRtl ? 'ميزان إلكتروني وضبط أذرعة' : 'Digital Wheel Alignment' ?></h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 1rem;"><?= $isRtl ? 'ضبط زوايا العجلات والمساعدات بالليزر لمنع مسحية الكفرات وثبات المركبة.' : 'Laser wheel alignment & suspension inspection for steering stability.' ?></p>
      <button class="btn-primary" style="margin: 0 auto; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="prefillService('Digital Alignment')">
        <?= $isRtl ? 'حجز موعد ميزان' : 'Book Alignment' ?>
      </button>
    </div>

    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem; text-align: center;">
      <div style="font-size: 2.8rem; margin-bottom: 0.75rem;">💻</div>
      <h3 style="font-weight: 800; color: #fff; font-size: 1.15rem;"><?= $isRtl ? 'فحص كمبيوتر وبرمجة' : 'Computer Scan & Diagnostics' ?></h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 1rem;"><?= $isRtl ? 'فحص شامل لكافة الحساسات ولمبة المحرك (Check Engine) وقراءة الأعطال.' : 'Comprehensive OBD-II scan to diagnose engine and transmission check lights.' ?></p>
      <button class="btn-primary" style="margin: 0 auto; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="prefillService('Computer Diagnostics')">
        <?= $isRtl ? 'فحص شامل' : 'Diagnostic Scan' ?>
      </button>
    </div>

    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem; text-align: center;">
      <div style="font-size: 2.8rem; margin-bottom: 0.75rem;">❄️</div>
      <h3 style="font-weight: 800; color: #fff; font-size: 1.15rem;"><?= $isRtl ? 'صيانة التكييف والفريون' : 'AC & Climate Control' ?></h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.5rem 0 1rem;"><?= $isRtl ? 'تعبئة فريون أصلي، فحص تسريب الكمبروسر، وتنظيف دورة التبريد.' : 'AC refrigerant recharge, compressor leak checks and evaporator cleaning.' ?></p>
      <button class="btn-primary" style="margin: 0 auto; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="prefillService('AC Repair')">
        <?= $isRtl ? 'فحص المكيف' : 'Check AC' ?>
      </button>
    </div>

  </div>

  <!-- Booking Form Card -->
  <div class="search-card" style="max-width: 760px; margin: 0 auto; padding: 2.5rem;">
    <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem;">
      📅 <?= $isRtl ? 'حجز موعد صيانة أو ميكانيكي' : 'Service Appointment Booking' ?>
    </h3>

    <form onsubmit="handleWorkshopBooking(event)">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        
        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'الاسم الكامل' : 'Full Name' ?> *</label>
          <input type="text" id="wsName" class="form-control" required placeholder="<?= $isRtl ? 'مثال: محمد الشهري' : 'e.g. Mohammed Al-Shehri' ?>">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'رقم الجوال' : 'Mobile Number' ?> *</label>
          <input type="tel" id="wsPhone" class="form-control" required placeholder="05xxxxxxxx">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'نوع الخدمة المطلوبة' : 'Service Type' ?> *</label>
          <select id="wsService" class="form-control">
            <option value="Mobile Workshop"><?= $isRtl ? 'ورشة متنقلة لموقعي (Mobile Workshop)' : 'Mobile Workshop to My Location' ?></option>
            <option value="Digital Alignment"><?= $isRtl ? 'ميزان إلكتروني وضبط زوايا (Wheel Alignment)' : 'Digital Alignment' ?></option>
            <option value="Computer Diagnostics"><?= $isRtl ? 'فحص كمبيوتر وبرمجة (OBD Scan)' : 'Computer Diagnostics' ?></option>
            <option value="AC Repair"><?= $isRtl ? 'صيانة مكيف وفريون (AC Service)' : 'AC & Climate Service' ?></option>
            <option value="General Mechanical"><?= $isRtl ? 'صيانة ميكانيكية عامة (General Mechanic)' : 'General Mechanic' ?></option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'المدينة والحي' : 'City & District' ?> *</label>
          <input type="text" id="wsLocation" class="form-control" required placeholder="<?= $isRtl ? 'الرياض - حي الملز' : 'Riyadh - Al-Malaz' ?>">
        </div>

      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'طراز وسنة السيارة والمشكلة' : 'Vehicle Make, Model & Symptoms' ?> *</label>
        <textarea id="wsDetails" class="form-control" rows="3" required placeholder="<?= $isRtl ? 'مثال: نيسان صني 2020، صوت طقطقة في المساعدات الأمامية عند المطبات...' : 'e.g. Nissan Sunny 2020, rattling sound over bumps in front suspension...' ?>"></textarea>
      </div>

      <button type="submit" id="wsSubmitBtn" class="btn-primary" style="width: 100%; padding: 1rem;">
        <span><?= $isRtl ? 'تأكيد الحجز وتوجيه الطلب للورشة' : 'Confirm Booking & Route to Workshop' ?></span>
        <span>✅</span>
      </button>
    </form>
  </div>

</div>

<script>
function prefillService(srv) {
  const select = document.getElementById('wsService');
  if (select) select.value = srv;
  document.getElementById('wsDetails').focus();
  Parto.showToast('<?= $isRtl ? "تم اختيار الخدمة، أكمل بيانات الحجز" : "Service selected, complete details" ?>');
}

async function handleWorkshopBooking(e) {
  e.preventDefault();
  const btn = document.getElementById('wsSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span><?= $isRtl ? "جاري تأكيد الموعد..." : "Confirming booking..." ?></span>';

  const payload = {
    customerName: document.getElementById('wsName').value,
    customerPhone: document.getElementById('wsPhone').value,
    pickupLocation: document.getElementById('wsLocation').value,
    dropoffLocation: 'Authorized Partner Workshop',
    vehicleDetails: `${document.getElementById('wsService').value} - ${document.getElementById('wsDetails').value}`,
    serviceType: 'workshop'
  };

  try {
    const res = await fetch('api/dispatch.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.success) {
      alert('<?= $isRtl ? "تم استلام حجزك بنجاح! سيقوم الفني أو مسؤول الورشة بالاتصال بك خلال 15 دقيقة للتأكيد." : "Booking received! A technician will call you within 15 minutes." ?>');
      window.location.href = '<?= Url::to(['/']) ?>';
    }
  } catch (err) {
    alert('<?= $isRtl ? "حدث خطأ أثناء إرسال الحجز" : "Error sending booking" ?>');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span><?= $isRtl ? "تأكيد الحجز وتوجيه الطلب للورشة" : "Confirm Booking & Route to Workshop" ?></span><span>✅</span>';
  }
}
</script>
