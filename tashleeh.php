<?php
$pageTitle = 'تشليح سيارات وقطع غيار مستعملة | بارتو السعودية';
$activeNav = 'tashleeh';
require_once __DIR__ . '/config/db.php';
global $isRtl;

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 1100px; margin: 2rem auto 4rem; padding: 0 1.5rem;">

  <!-- Hero Header -->
  <div style="text-align: center; margin-bottom: 2.5rem;">
    <div class="hero-pill" style="margin-bottom: 1rem;">
      <span>🚗</span>
      <span><?= $isRtl ? 'شبكة التشليح والسكراب المعتمدة' : 'Verified Tashleeh Scrapyards Network' ?></span>
    </div>
    <h1 style="font-size: 2.5rem; font-weight: 900; color: #fff; margin-bottom: 0.8rem;">
      <?= $isRtl ? 'اطلب أي قطعة مستعملة من التشليح في ثوانٍ' : 'Request Any Used Part From Salvage Yards' ?>
    </h1>
    <p style="color: var(--text-secondary); max-width: 680px; margin: 0 auto; font-size: 1.05rem;">
      <?= $isRtl 
        ? 'أرسل مواصفات سيارتك والقطعة المطلوبة، وسيصل طلبك فوراً إلى عشرات بائعي التشليح المعتمدين في الرياض وجدة لتستقبل عروض أسعار فورية وتنافسية.' 
        : 'Broadcast your required auto part to dozens of verified scrapyards in Riyadh, Jeddah & Dammam. Receive real-time competitive quotes.' ?>
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 760px; margin: 0 auto;">

    <!-- Request Submission Form -->
    <div id="requestFormContainer" class="search-card" style="padding: 2rem;">
      <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>📝</span>
        <span><?= $isRtl ? 'نموذج طلب قطعة من التشليح' : 'Tashleeh Part Request Form' ?></span>
      </h3>

      <form id="tashleehRequestForm" onsubmit="handleTashleehSubmit(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'اسم العميل' : 'Your Name' ?> *</label>
            <input type="text" id="custName" class="form-control" required placeholder="<?= $isRtl ? 'مثال: فهد المطيري' : 'e.g. Fahad Al-Mutairi' ?>">
          </div>

          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'رقم الجوال' : 'Mobile Phone' ?> *</label>
            <input type="tel" id="custPhone" class="form-control" required placeholder="<?= $isRtl ? '050xxxxxxx' : '+966 50 xxx xxxx' ?>">
          </div>

          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'شركة السيارة (الماركة)' : 'Vehicle Make' ?> *</label>
            <input type="text" id="vehMake" class="form-control" required placeholder="<?= $isRtl ? 'مثال: تويوتا، نيسان، هيونداي' : 'e.g. Toyota, Nissan, Hyundai' ?>">
          </div>

          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'الموديل (الطراز)' : 'Vehicle Model' ?> *</label>
            <input type="text" id="vehModel" class="form-control" required placeholder="<?= $isRtl ? 'مثال: كامري، باترول، سوناتا' : 'e.g. Camry, Patrol, Sonata' ?>">
          </div>

          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'سنة الصنع' : 'Model Year' ?> *</label>
            <input type="text" id="vehYear" class="form-control" required placeholder="<?= $isRtl ? 'مثال: 2021' : 'e.g. 2021' ?>">
          </div>

          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'القطعة المطلوبة بدقة' : 'Part Name Needed' ?> *</label>
            <input type="text" id="partNeeded" class="form-control" required placeholder="<?= $isRtl ? 'مثال: باب يمين أمامي، كمبروسر، كمبيوتر' : 'e.g. Right Front Door, AC Compressor' ?>">
          </div>

        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'ملاحظات إضافية أو رقم الهيكل (VIN) إن وجد' : 'Additional Notes or VIN (Optional)' ?></label>
          <textarea id="partNotes" class="form-control" rows="2" placeholder="<?= $isRtl ? 'أي مواصفات إضافية مثل اللون، نوع المحرك، شروط الضمان...' : 'Color, engine size, condition preferences...' ?>"></textarea>
        </div>

        <button type="submit" id="submitRfqBtn" class="btn-primary" style="width: 100%; margin-top: 0.5rem; padding: 1rem;">
          <span><?= $isRtl ? 'إرسال الطلب لكافة ساحات التشليح' : 'Broadcast to All Scrapyards' ?></span>
          <span>⚡</span>
        </button>
      </form>
    </div>

    <!-- Live Quotes Tracking Panel -->
    <div id="liveTrackingPanel" class="search-card" style="display: none; padding: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <span style="font-size: 0.8rem; color: #34d399; font-weight: 800;">● <?= $isRtl ? 'البث المباشر نشط' : 'LIVE BROADCAST ACTIVE' ?></span>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-top: 0.2rem;">
            <?= $isRtl ? 'متابعة عروض أسعار التشليح' : 'Live Scrapyard Quotes' ?>
          </h3>
        </div>
        <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="resetRequest()">
          <?= $isRtl ? 'طلب جديد' : 'New Request' ?>
        </button>
      </div>

      <div id="activeRequestSummary" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
        <!-- Populated via JS -->
      </div>

      <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 1rem; color: #fff;">
        <?= $isRtl ? 'العروض المستلمة من أصحاب التشليح:' : 'Received Vendor Quotes:' ?>
      </div>

      <div id="quotesList" style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Quotes will be injected here -->
      </div>
    </div>

  </div>

  <!-- Verified Tashleeh Yards Section -->
  <div style="margin-top: 4rem;">
    <h3 style="font-size: 1.45rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem;">
      📍 <?= $isRtl ? 'أبرز مناطق وساحات التشليح المتصلة بالنظام' : 'Connected Scrapyard Hubs' ?>
    </h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem;">
        <div style="font-size: 1.1rem; font-weight: 800; color: #fff;">تشليح الحائر (الرياض)</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;">أكبر تجمع لقطع السيارات المستعملة والياباني والأمريكي مع فحص وضمان.</p>
      </div>
      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem;">
        <div style="font-size: 1.1rem; font-weight: 800; color: #fff;">تشليح بريمان وقويزة (جدة)</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;">تغطية شاملة للمنطقة الغربية لسيارات الهايبرد والدفع الرباعي والمحركات.</p>
      </div>
      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem;">
        <div style="font-size: 1.1rem; font-weight: 800; color: #fff;">تشليح طريق بقيق (الدمام)</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;">خدمة المنطقة الشرقية والخليج لسيارات البيك أب والشاحنات والسيارات الفاخرة.</p>
      </div>
    </div>
  </div>

</div>

<script>
let currentRequestId = null;
let pollTimer = null;

// Read prefilled query parameters from URL (e.g. from AI redirection)
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('partName')) document.getElementById('partNeeded').value = params.get('partName');
  if (params.get('make')) document.getElementById('vehMake').value = params.get('make');
  if (params.get('model')) document.getElementById('vehModel').value = params.get('model');
  if (params.get('year')) document.getElementById('vehYear').value = params.get('year');

  const reqId = params.get('id') || localStorage.getItem('parto_active_rfq');
  if (reqId) {
    trackRequest(reqId);
  }
});

async function handleTashleehSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitRfqBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>جاري البث لكافة الساحات...</span>';

  const payload = {
    customerName: document.getElementById('custName').value,
    customerPhone: document.getElementById('custPhone').value,
    vehicleMake: document.getElementById('vehMake').value,
    vehicleModel: document.getElementById('vehModel').value,
    vehicleYear: document.getElementById('vehYear').value,
    partName: document.getElementById('partNeeded').value,
    notes: document.getElementById('partNotes').value,
  };

  try {
    const res = await fetch('api/tashleeh.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to submit request');

    localStorage.setItem('parto_active_rfq', data.request.id);
    trackRequest(data.request.id);
    Parto.showToast('تم بث طلبك بنجاح لكافة ساحات التشليح!');
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>إرسال الطلب لكافة ساحات التشليح</span><span>⚡</span>';
  }
}

function trackRequest(id) {
  currentRequestId = id;
  document.getElementById('requestFormContainer').style.display = 'none';
  document.getElementById('liveTrackingPanel').style.display = 'block';

  fetchRequestQuotes();
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(fetchRequestQuotes, 3000);
}

async function fetchRequestQuotes() {
  if (!currentRequestId) return;
  try {
    const res = await fetch(`api/tashleeh.php?id=${encodeURIComponent(currentRequestId)}`);
    const data = await res.json();
    if (!res.ok || !data.success) return;

    const req = data.request;
    const quotes = data.quotes || [];

    document.getElementById('activeRequestSummary').innerHTML = `
      <div style="font-weight: 800; font-size: 1.1rem; color: #fff;">
        🚗 ${req.vehicle_make} ${req.vehicle_model} (${req.vehicle_year}) - ${req.part_name}
      </div>
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">
        صاحب الطلب: ${req.customer_name} • الحالة: <span class="status-pill status-${req.status}">${req.status}</span>
      </div>
    `;

    const listEl = document.getElementById('quotesList');
    if (quotes.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: rgba(0,0,0,0.2); border-radius: var(--radius-md);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📡</div>
          <div>تم إخطار باعة التشليح بطلبك. بانتظار تقديم أول تسعيرة...</div>
          <div style="font-size: 0.78rem; margin-top: 0.25rem;">يتم التحديث تلقائياً كل 3 ثوانٍ</div>
        </div>
      `;
    } else {
      listEl.innerHTML = quotes.map(q => `
        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>${q.tenant_logo || '🚗'}</span>
              <span style="font-weight: 800; color: #fff;">${q.tenant_name || 'تشليح معتمد'}</span>
              <span class="status-pill status-accepted">${q.condition_state}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.35rem;">
              ${q.notes ? `ملاحظات: ${q.notes} • ` : ''} هاتف: ${q.tenant_phone || 'متاح بعد القبول'}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="text-align: left;">
              <div style="font-size: 1.4rem; font-weight: 900; color: #38bdf8;">${parseFloat(q.price).toFixed(2)} ر.س</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">شامل الضمان والفحص</div>
            </div>
            ${q.status === 'accepted' ? `
              <span class="status-pill status-completed">تم القبول ✅</span>
            ` : `
              <button class="btn-primary" style="padding: 0.6rem 1.15rem; font-size: 0.85rem;" onclick="acceptQuote('${q.id}')">
                قبول العرض
              </button>
            `}
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Polling quotes error:', e);
  }
}

async function acceptQuote(quoteId) {
  if (!confirm('هل ترغب في اعتماد وقبول هذا العرض والتواصل مع صاحب التشليح؟')) return;
  try {
    const res = await fetch(`api/tashleeh.php?id=${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_id: quoteId, request_id: currentRequestId })
    });
    const d = await res.json();
    if (d.success) {
      Parto.showToast('تم قبول العرض بنجاح! سيتم التواصل معك لإتمام الاستلام والتوصيل.');
      fetchRequestQuotes();
    }
  } catch (err) {
    alert('حدث خطأ أثناء قبول العرض');
  }
}

function resetRequest() {
  localStorage.removeItem('parto_active_rfq');
  currentRequestId = null;
  if (pollTimer) clearInterval(pollTimer);
  document.getElementById('liveTrackingPanel').style.display = 'none';
  document.getElementById('requestFormContainer').style.display = 'block';
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
