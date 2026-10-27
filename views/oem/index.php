<?php

/** @var yii\web\View $this */
/** @var bool $isRtl */
/** @var app\models\Product[] $oemProducts */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'كتالوج قطع غيار الوكالة والأرقام الأصلية | بارتو السعودية' 
    : 'OEM Fitment Catalog & Genuine Part Numbers | PARTO Saudi Arabia';
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
      
      <?php if (!empty($oemProducts)): ?>
        <?php foreach ($oemProducts as $p): ?>
          <div class="product-card" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span class="badge badge-category"><?= Html::encode($p->brand_name) ?> Genuine</span>
              <span style="font-family: monospace; font-size: 0.85rem; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;"><?= Html::encode($p->oem_part_number) ?></span>
            </div>
            <h4 style="color: #fff; font-size: 1.05rem; font-weight: 800; margin-bottom: 0.5rem;">
              <a href="<?= Url::to(['/product/view', 'id' => $p->id]) ?>" style="color: inherit; text-decoration: none;">
                <?= Html::encode($p->name) ?>
              </a>
            </h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">
              <?= $isRtl ? 'الوزن: ' . number_format((float)($p->weight ?? 1.5), 2) . ' كجم • القسم: ' . Html::encode($p->category) : 'Weight: ' . number_format((float)($p->weight ?? 1.5), 2) . ' kg • ' . Html::encode($p->category) ?>
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 1.25rem; font-weight: 900; color: #38bdf8;"><?= number_format((float)$p->price, 2) ?> <?= $isRtl ? 'ر.س' : 'SAR' ?></span>
              <div style="display: flex; gap: 0.4rem;">
                <a href="<?= Url::to(['/product/view', 'id' => $p->id]) ?>" class="btn-primary" style="padding: 0.5rem 0.75rem; font-size: 0.85rem; background: rgba(255,255,255,0.08); border: 1px solid var(--border-dark); box-shadow: none;" title="Details">
                  🔍
                </a>
                <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="Parto.addToCart({id: '<?= Html::encode($p->id) ?>', name: '<?= Html::encode($p->name) ?>', price: <?= (float)$p->price ?>, image: '<?= Html::encode($p->image) ?>', brand_name: '<?= Html::encode($p->brand_name) ?>', tenant_id: '<?= Html::encode($p->tenant_id) ?>'})">
                  <?= $isRtl ? 'طلب القطعة' : 'Order Part' ?>
                </button>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>

    </div>
  </div>

</div>

<script>
function searchOem() {
  const q = document.getElementById('oemSearchInput').value.trim();
  if (!q) {
    Parto.showToast('<?= $isRtl ? "أدخل رقم القطعة للبحث" : "Enter OEM part number" ?>');
    return;
  }
  window.location.href = `<?= Url::to(['/site/index']) ?>?q=${encodeURIComponent(q)}`;
}
</script>
