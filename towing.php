<?php
$pageTitle = 'طلب سطحة فورية وسحب سيارات | بارتو السعودية';
$activeNav = 'towing';
require_once __DIR__ . '/config/db.php';
global $isRtl;

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 800px; margin: 2rem auto 4rem; padding: 0 1.5rem;">

  <div style="text-align: center; margin-bottom: 2.5rem;">
    <div class="hero-pill" style="margin-bottom: 1rem;">
      <span>🛻</span>
      <span><?= $isRtl ? 'طوارئ الطرق والسطحات 24/7' : '24/7 Roadside Towing & Flatbed' ?></span>
    </div>
    <h1 style="font-size: 2.4rem; font-weight: 900; color: #fff; margin-bottom: 0.8rem;">
      <?= $isRtl ? 'طلب سطحة ونقل مركبات فورية' : 'Instant Tow Truck & Flatbed Dispatch' ?>
    </h1>
    <p style="color: var(--text-secondary); font-size: 1.05rem;">
      <?= $isRtl 
        ? 'أقرب سطحة إليك بضغطة زر. تتبع مسار السائق لحظة بلحظة مع تسعيرة موحدة وثابتة.' 
        : 'Emergency flatbed tow trucks across all Saudi regions. Real-time driver tracking and fixed transparent rates.' ?>
    </p>
  </div>

  <!-- Form Container -->
  <div id="towingFormCard" class="search-card" style="padding: 2rem;">
    <h3 style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem;">
      🚨 <?= $isRtl ? 'بيانات طلب السحب والإنقاذ' : 'Tow Request Details' ?>
    </h3>

    <form onsubmit="handleTowingSubmit(event)">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        
        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'اسم صاحب المركبة' : 'Your Name' ?> *</label>
          <input type="text" id="towName" class="form-control" required placeholder="<?= $isRtl ? 'مثال: سلطان الخالدي' : 'e.g. Sultan Al-Khaldi' ?>">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'رقم الجوال للتواصل' : 'Mobile Phone' ?> *</label>
          <input type="tel" id="towPhone" class="form-control" required placeholder="05xxxxxxxx">
        </div>

      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'موقع السيارة الحالي (مكان التحميل)' : 'Pickup Location' ?> *</label>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="towPickup" class="form-control" required placeholder="<?= $isRtl ? 'مثال: طريق الدائري الشمالي مخرج 6 - الرياض' : 'e.g. Northern Ring Road Exit 6, Riyadh' ?>">
          <button type="button" class="btn-primary" style="padding: 0 1rem; font-size: 0.85rem;" onclick="useCurrentLocation()">
            📍 <?= $isRtl ? 'موقعي' : 'GPS' ?>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'جهة التوصيل (الورشة أو الوجهة)' : 'Dropoff Location' ?> *</label>
        <input type="text" id="towDropoff" class="form-control" required placeholder="<?= $isRtl ? 'مثال: صناعية أم الحمام / صناعية الشمال' : 'e.g. Al-Sulay Industrial Area / Auto Workshop' ?>">
      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'نوع المركبة وطبيعة العطل' : 'Vehicle Type & Trouble Description' ?></label>
        <input type="text" id="towVehicle" class="form-control" placeholder="<?= $isRtl ? 'مثال: تويوتا كامري 2022 - قير خربان ولا تتحرك' : 'e.g. Toyota Camry 2022 - Transmission Failure' ?>">
      </div>

      <div style="background: rgba(37,99,235,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 800; color: #fff; font-size: 0.95rem;"><?= $isRtl ? 'السعر التقديري داخل المدينة' : 'Estimated City Tow Rate' ?></div>
          <div style="font-size: 0.8rem; color: var(--text-muted);"><?= $isRtl ? 'يشمل التحميل والتنزيل والتأمين' : 'Includes loading, transport & transit insurance' ?></div>
        </div>
        <div style="font-size: 1.4rem; font-weight: 900; color: #38bdf8;">120.00 <?= $isRtl ? 'ر.س' : 'SAR' ?></div>
      </div>

      <button type="submit" id="submitTowBtn" class="btn-primary" style="width: 100%; padding: 1rem;">
        <span><?= $isRtl ? 'طلب أقرب سطحة فورية الآن' : 'Dispatch Nearest Flatbed Now' ?></span>
        <span>🚀</span>
      </button>
    </form>
  </div>

  <!-- Live Dispatch Tracker -->
  <div id="towingTrackerCard" class="search-card" style="display: none; padding: 2.5rem; text-align: center;">
    <div id="trackerIcon" style="font-size: 4rem; margin-bottom: 1.25rem;">📡</div>
    <h2 id="trackerStatusTitle" style="font-size: 1.6rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem;">
      <?= $isRtl ? 'جاري البحث عن أقرب سطحة...' : 'Broadcasting Dispatch Request...' ?>
    </h2>
    <p id="trackerStatusDesc" style="color: var(--text-secondary); font-size: 0.95rem; max-width: 480px; margin: 0 auto 1.5rem;">
      <?= $isRtl ? 'تم إرسال موقعك إلى كباتن السطحات في نطاق 5 كم. جاري تأكيد السائق...' : 'Broadcasting your coordinates to flatbed operators in your area...' ?>
    </p>

    <!-- Driver Card -->
    <div id="driverCard" style="display: none; background: rgba(255,255,255,0.05); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem; text-align: right;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div style="font-size: 2.2rem;">🛻</div>
          <div>
            <div id="driverName" style="font-weight: 800; font-size: 1.1rem; color: #fff;">شركة نجم لخدمات السطحات</div>
            <div style="font-size: 0.82rem; color: #34d399;">كابتن معتمد ومفحوص • سطحة هيدروليك حديثة</div>
          </div>
        </div>
        <a id="driverCallBtn" href="tel:+966587765544" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
          📞 <?= $isRtl ? 'اتصال بالسائق' : 'Call Driver' ?>
        </a>
      </div>
    </div>

    <button class="btn-primary" style="margin: 0 auto; background: rgba(255,255,255,0.1); border: 1px solid var(--border-dark);" onclick="resetTowing()">
      <?= $isRtl ? 'إلغاء أو طلب جديد' : 'Cancel / New Dispatch' ?>
    </button>
  </div>

</div>

<script>
let currentDispatchId = null;
let dispatchTimer = null;

function useCurrentLocation() {
  if (navigator.geolocation) {
    document.getElementById('towPickup').value = 'جاري تحديد إحداثيات GPS...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById('towPickup').value = `موقع GPS المباشر: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
        Parto.showToast('تم تحديد موقعك بدقة!');
      },
      () => {
        document.getElementById('towPickup').value = 'طريق الملك فهد - الرياض (تلقائي)';
      }
    );
  } else {
    document.getElementById('towPickup').value = 'طريق الملك فهد - الرياض';
  }
}

async function handleTowingSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitTowBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري الإرسال للسطحات...</span>';

  const payload = {
    customerName: document.getElementById('towName').value,
    customerPhone: document.getElementById('towPhone').value,
    pickupLocation: document.getElementById('towPickup').value,
    dropoffLocation: document.getElementById('towDropoff').value,
    vehicleDetails: document.getElementById('towVehicle').value,
    serviceType: 'tow'
  };

  try {
    const res = await fetch('api/dispatch.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (!res.ok || !d.success) throw new Error(d.error || 'Failed to request dispatch');

    currentDispatchId = d.dispatch.id;
    startTrackingDispatch(currentDispatchId);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>طلب أقرب سطحة فورية الآن</span><span>🚀</span>';
  }
}

function startTrackingDispatch(id) {
  document.getElementById('towingFormCard').style.display = 'none';
  document.getElementById('towingTrackerCard').style.display = 'block';

  pollDispatch();
  if (dispatchTimer) clearInterval(dispatchTimer);
  dispatchTimer = setInterval(pollDispatch, 3000);
}

async function pollDispatch() {
  if (!currentDispatchId) return;
  try {
    const res = await fetch(`api/dispatch.php?id=${encodeURIComponent(currentDispatchId)}`);
    const d = await res.json();
    if (!res.ok || !d.success) return;

    const dispatch = d.dispatch;
    const icon = document.getElementById('trackerIcon');
    const title = document.getElementById('trackerStatusTitle');
    const desc = document.getElementById('trackerStatusDesc');
    const driverCard = document.getElementById('driverCard');

    if (dispatch.status === 'pending') {
      icon.textContent = '📡';
      title.textContent = 'جاري البحث عن أقرب سطحة في محيطك...';
      desc.textContent = 'تم إخطار السائقين القريبين منك، بانتظار تأكيد استلام المهمة.';
      driverCard.style.display = 'none';
    } else if (dispatch.status === 'accepted') {
      icon.textContent = '✅';
      title.textContent = 'تم تعيين السائق وقبول المهمة!';
      desc.textContent = 'يقوم السائق حالياً ببدء التحرك نحو موقعك.';
      driverCard.style.display = 'block';
      if (dispatch.driver_name) document.getElementById('driverName').textContent = dispatch.driver_name;
    } else if (dispatch.status === 'en_route') {
      icon.textContent = '🛻';
      title.textContent = 'السطحة في طريقها إليك الآن!';
      desc.textContent = 'الوقت التقديري للوصول: 8 إلى 12 دقيقة. يرجى الوقوف في مكان آمن بجانب الطريق.';
      driverCard.style.display = 'block';
    } else if (dispatch.status === 'completed') {
      icon.textContent = '🎉';
      title.textContent = 'تم إكمال عملية النقل بنجاح!';
      desc.textContent = 'شكراً لاستخدامك منصة بارتو. نرجو لك ولعائلتك دوام السلامة.';
    }
  } catch (e) {
    console.error('Dispatch polling error:', e);
  }
}

function resetTowing() {
  if (dispatchTimer) clearInterval(dispatchTimer);
  currentDispatchId = null;
  document.getElementById('towingTrackerCard').style.display = 'none';
  document.getElementById('towingFormCard').style.display = 'block';
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
