<?php
$pageTitle = 'كتالوج قطع غيار الوكالة والأرقام الأصلية | بارتو السعودية';
$activeNav = 'oem';
require_once __DIR__ . '/config/db.php';
global $isRtl;

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 1200px; margin: 2rem auto 4rem; padding: 0 1.5rem;">

  <div style="text-align: center; margin-bottom: 2.5rem;">
    <div class="hero-pill" style="margin-bottom: 1rem;">
      <span>📐</span>
      <span><?= $isRtl ? 'المطابقة الهندسية ورقم القطعة OEM' : 'Technical Fitment & OEM Part Cross-Reference' ?></span>
    </div>
    <h1 style="font-size: 2.4rem; font-weight: 900; color: #fff; margin-bottom: 0.8rem;">
      <?= $isRtl ? 'كتالوج الوكالة ومطابقة الأرقام الأصلية' : 'OEM Parts Catalog & Technical Fitment' ?>
    </h1>
    <p style="color: var(--text-secondary); font-size: 1.05rem; max-width: 700px; margin: 0 auto;">
      <?= $isRtl 
        ? 'ابحث برقم القطعة الأصلي (OEM Part Number) للتأكد من توافقها الدقيق مع سيارتك قبل الشراء واستعراض المخططات التوضيحية.' 
        : 'Verify OEM part numbers, exploded diagrams, weight specifications, and model compatibility directly.' ?>
    </p>
  </div>

  <!-- OEM Search Box -->
  <div class="search-card" style="max-width: 820px; margin: 0 auto 3rem; padding: 1.75rem;">
    <div style="font-weight: 800; font-size: 1.05rem; color: #fff; margin-bottom: 1rem;">
      🔍 <?= $isRtl ? 'البحث بالرقم الأصلي للقطعة' : 'Search by OEM Part Number' ?>
    </div>
    <div class="search-form-row">
      <div class="search-input-group">
        <input type="text" id="oemSearchInput" class="search-input" placeholder="<?= $isRtl ? 'مثال: 04465-33471 أو 43512-33140 أو 24321-2G111...' : 'e.g. 04465-33471, 43512-33140, 24321-2G111...' ?>">
      </div>
      <button class="btn-primary" onclick="searchOem()">
        <span><?= $isRtl ? 'فحص المطابقة' : 'Check Fitment' ?></span>
        <span>⚡</span>
      </button>
    </div>
  </div>

  <!-- Exploded Schematics Demo & Top OEM Items -->
  <div>
    <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem;">
      📦 <?= $isRtl ? 'قطع غيار وكالة أصلية موثقة برقم المصنع' : 'Verified OEM Parts Catalog' ?>
    </h3>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;" id="oemCatalogList">
      
      <div class="product-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-category">Toyota Genuine</span>
          <span style="font-family: monospace; font-size: 0.85rem; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">04465-33471</span>
        </div>
        <h4 style="color: #fff; font-size: 1.05rem; font-weight: 800; margin-bottom: 0.5rem;">طقم فحمات فرامل سيراميك تويوتا كامري وأفالون</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">الوزن: 2.20 كجم • الأبعاد: 20x15x8 سم • التوافق: كامري، أفالون، لكزس ES350 (2018–2025).</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 1.25rem; font-weight: 900; color: #38bdf8;">385.00 ر.س</span>
          <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="Parto.addToCart({id: 'p-toyota-pads', name: 'Toyota Camry Genuine Ceramic Brake Pads Kit', price: 385, image: 'assets/images/parts/brakes.svg', brand_name: 'Toyota'})">
            <?= $isRtl ? 'طلب القطعة' : 'Order Part' ?>
          </button>
        </div>
      </div>

      <div class="product-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-category">Lexus Genuine</span>
          <span style="font-family: monospace; font-size: 0.85rem; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">43512-33140</span>
        </div>
        <h4 style="color: #fff; font-size: 1.05rem; font-weight: 800; margin-bottom: 0.5rem;">هوب فرامل أمامي مهوى لكزس ES350 و RX350</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">الوزن: 7.40 كجم • الأبعاد: 34x34x8 سم • التوافق: لكزس ES350، RX350، LX570.</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 1.25rem; font-weight: 900; color: #38bdf8;">640.00 ر.س</span>
          <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="Parto.addToCart({id: 'p-lexus-rotor', name: 'Lexus ES350 Front Brake Rotor Disc', price: 640, image: 'assets/images/parts/brakes.svg', brand_name: 'Lexus'})">
            <?= $isRtl ? 'طلب القطعة' : 'Order Part' ?>
          </button>
        </div>
      </div>

      <div class="product-card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-category">Nissan Genuine</span>
          <span style="font-family: monospace; font-size: 0.85rem; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">15010-1LA0A</span>
        </div>
        <h4 style="color: #fff; font-size: 1.05rem; font-weight: 800; margin-bottom: 0.5rem;">طرمبة زيت محرك نيسان باترول Y62 V8 الأصلية</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">الوزن: 3.80 كجم • محركات VK56DE / VK56VD لنيسان باترول وأرمادا وتيتان.</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 1.25rem; font-weight: 900; color: #38bdf8;">920.00 ر.س</span>
          <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="Parto.addToCart({id: 'p-nissan-oil-pump', name: 'Nissan Patrol Y62 V8 Engine Oil Pump', price: 920, image: 'assets/images/parts/engine.svg', brand_name: 'Nissan'})">
            <?= $isRtl ? 'طلب القطعة' : 'Order Part' ?>
          </button>
        </div>
      </div>

    </div>
  </div>

</div>

<script>
function searchOem() {
  const q = document.getElementById('oemSearchInput').value.trim();
  if (!q) {
    Parto.showToast('أدخل رقم القطعة للبحث');
    return;
  }
  window.location.href = `index.php?q=${encodeURIComponent(q)}`;
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
