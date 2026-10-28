<?php

/** @var yii\web\View $this */
/** @var app\models\Product[] $products */
/** @var array $popularBrands */
/** @var array $categories */
/** @var app\models\Tenant[] $tenants */
/** @var bool $isRtl */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'بارتو السعودية | سوق قطع غيار السيارات والخدمات المتكاملة' 
    : 'PARTO Saudi Arabia | Auto Spare Parts & Automotive Hub';
?>

<!-- Hero Section with VIN Decoder & Search -->
<section class="hero-section">
  <div class="hero-container">
    
    <div class="hero-pill">
      <span>🚀</span>
      <span><?= $isRtl ? 'سوق قطع الغيار الرقمي الأول بالمملكة' : 'Saudi Arabia\'s Unified Automotive Hub' ?></span>
    </div>

    <h1 class="hero-title">
      <?= $isRtl ? 'كل ما تحتاجه سيارتك' : 'Everything Your Vehicle Needs' ?><br>
      <span class="gradient-text"><?= $isRtl ? 'قطع غيار أصلية، ورش معتمدة، وسطحات فورية' : 'Genuine OEM Parts, Certified Workshops & Towing' ?></span>
    </h1>

    <p class="hero-subtitle">
      <?= $isRtl 
        ? 'ابحث برقم الهيكل (VIN) أو اسم القطعة، وقارن أسعار الموزعين والوكالات المعتمدة في الرياض وجدة وكافة أنحاء المملكة.' 
        : 'Search by VIN or part name. Compare prices across certified distributors and authorized suppliers in seconds.' ?>
    </p>

    <!-- Search Box with Tabs -->
    <div class="search-card">
      <div class="search-tabs">
        <button class="tab-btn active" data-tab="vin">
          <span>🔍</span>
          <span><?= $isRtl ? 'البحث برقم الهيكل (VIN)' : 'Search by VIN' ?></span>
        </button>
        <button class="tab-btn" data-tab="part">
          <span>⚙️</span>
          <span><?= $isRtl ? 'البحث السريع باسم القطعة' : 'Quick Part Search' ?></span>
        </button>
      </div>

      <!-- VIN Search Tab -->
      <div id="vinSearchBox">
        <form onsubmit="Parto.handleVinSearch(event)" class="search-form-row">
          <div class="search-input-group">
            <input type="text" id="vinInput" class="search-input" placeholder="<?= $isRtl ? 'أدخل رقم الهيكل المكون من 17 خانة (مثال: 4T1B11HK5JU...)' : 'Enter 17-digit vehicle VIN (e.g., 4T1B11HK5JU...)' ?>" maxlength="20">
          </div>
          <button type="submit" id="vinSubmitBtn" class="btn-primary">
            <span><?= $isRtl ? 'فك التشفير وفحص التوافق' : 'Decode & Match Parts' ?></span>
            <span>⚡</span>
          </button>
        </form>
        <div id="vinResultBox" class="vin-result-card" style="display: none;"></div>
      </div>

      <!-- Part Quick Search Tab -->
      <div id="partQuickSearchBox" style="display: none;">
        <div class="search-form-row">
          <div class="search-input-group">
            <input type="text" id="partSearchInput" class="search-input" placeholder="<?= $isRtl ? 'ابحث باسم القطعة (مثال: فحمات كامري، هوبات لكزس، طرمبة زيت باترول)...' : 'Search part name (e.g. Camry Brake Pads, Lexus Rotor, Patrol Oil Pump)...' ?>">
          </div>
          <button type="button" class="btn-primary" onclick="Parto.filterCatalog()">
            <span><?= $isRtl ? 'بحث في المتجر' : 'Search Store' ?></span>
          </button>
        </div>
      </div>

    </div>

  </div>
</section>

<!-- Popular Vehicle Brands -->
<section class="brands-section">
  <div class="section-header">
    <h2 class="section-title">
      <span>🚘</span>
      <span><?= $isRtl ? 'تصفح حسب الشركة المصنعة' : 'Browse by Vehicle Make' ?></span>
    </h2>
    <span style="font-size: 0.85rem; color: var(--text-muted);"><?= $isRtl ? 'اختر شركتك لفلترة القطع المتوافقة' : 'Select make to filter compatibility' ?></span>
  </div>

  <div class="brands-grid">
    <?php foreach ($popularBrands as $b): ?>
      <div class="brand-card" data-brand="<?= Html::encode($b['name']) ?>">
        <img src="<?= Html::encode($b['logo']) ?>" alt="<?= Html::encode($b['name']) ?>" class="brand-logo-img" loading="lazy">
        <span class="brand-name"><?= Html::encode($b['name']) ?></span>
      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- Category Filter Pills -->
<div class="categories-bar">
  <?php foreach ($categories as $catKey => $catLabel): ?>
    <button class="category-pill <?= $catKey === 'all' ? 'active' : '' ?>" data-category="<?= Html::encode($catKey) ?>">
      <?= Html::encode($catLabel) ?>
    </button>
  <?php endforeach; ?>
</div>

<!-- My Garage / كراج سياراتي Bar -->
<div class="garage-banner" id="garageBanner">
  <div class="garage-card">
    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
      <div style="font-size: 2rem; background: rgba(59, 130, 246, 0.15); width: 50px; height: 50px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(59,130,246,0.3);">
        🚗
      </div>
      <div>
        <div style="font-size: 0.78rem; color: #60a5fa; font-weight: 800; text-transform: uppercase;">
          <?= $isRtl ? 'كراجي للتحقق من الملاءمة والتوافق' : 'My Personal Garage & Fitment' ?>
        </div>
        <div id="garageCurrentVehicle" style="font-size: 1.15rem; font-weight: 900; color: #fff;">
          <?= $isRtl ? 'لم يتم تحديد سيارة بعد' : 'No vehicle selected yet' ?>
        </div>
        <div id="garageSubtext" style="font-size: 0.8rem; color: var(--text-muted);">
          <?= $isRtl ? 'حدد سيارتك أو فك رقم الهيكل (VIN) لعرض حالة الملاءمة المؤكدة (Guaranteed Fit) على كل قطعة.' : 'Select your vehicle or decode VIN to check verified part fitment.' ?>
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
      <select id="quickGarageSelect" class="form-control" style="width: auto; padding: 0.6rem 1rem; font-size: 0.85rem;" onchange="Parto.handleQuickGarageSelect(this.value)">
        <option value=""><?= $isRtl ? '⚡ اختر سيارتك سريعاً...' : '⚡ Quick Select Vehicle...' ?></option>
        <option value="Toyota|Camry|2022">تويوتا كامري (2022 Toyota Camry)</option>
        <option value="Nissan|Patrol|2021">نيسان باترول (2021 Nissan Patrol Y62)</option>
        <option value="Hyundai|Sonata|2023">هيونداي سوناتا (2023 Hyundai Sonata)</option>
        <option value="Lexus|ES350|2021">لكزس ES350 (2021 Lexus ES)</option>
        <option value="Mazda|CX-9|2022">مازدا CX-9 (2022 Mazda CX-9)</option>
        <option value="BMW|5 Series|2022">بي إم دبليو الفئة الخامسة (BMW 5 Series)</option>
        <option value="Ford|Taurus|2022">فورد توروس (2022 Ford Taurus)</option>
      </select>

      <button id="garageClearBtn" class="btn-primary" style="display: none; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 0.6rem 1rem; font-size: 0.82rem;" onclick="Parto.clearGarageVehicle()">
        <?= $isRtl ? 'إزالة' : 'Clear' ?>
      </button>

      <label style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 700; color: #34d399; cursor: pointer; background: rgba(16, 185, 129, 0.1); padding: 0.6rem 0.9rem; border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.25);">
        <input type="checkbox" id="onlyFitFilter" onchange="Parto.toggleOnlyFit(this.checked)">
        <span><?= $isRtl ? 'المتوافقة فقط' : 'Guaranteed Fit Only' ?></span>
      </label>
    </div>
  </div>
</div>

<!-- Products Catalog Grid -->
<section class="products-section">
  <div class="section-header">
    <h2 class="section-title">
      <span>📦</span>
      <span><?= $isRtl ? 'القطع المتوفرة للطلب الفوري' : 'Available Parts in Stock' ?></span>
    </h2>
    <div style="font-size: 0.88rem; color: var(--text-secondary);">
      <?= count($products) ?> <?= $isRtl ? 'قطعة مسجلة' : 'items listed' ?>
    </div>
  </div>

  <div class="products-grid" id="productsGrid">
    <?php foreach ($products as $p): ?>
      <?php 
        $compatList = $p->getCompatibilityList();
        $productUrl = Url::to(['/product/view', 'id' => $p->id]);
        $tenantName = $p->tenant ? $p->tenant->name : 'Riyadh OEM Parts';
        $tenantLogo = $p->tenant && $p->tenant->logo ? $p->tenant->logo : '🏪';
      ?>
      <div class="product-card" data-brand="<?= Html::encode($p->brand_name) ?>" data-category="<?= Html::encode($p->category) ?>" data-compat="<?= Html::encode(json_encode($compatList)) ?>">
        
        <a href="<?= $productUrl ?>" class="product-image-container" title="<?= Html::encode($p->name) ?>">
          <img src="<?= Html::encode($p->image) ?>" alt="<?= Html::encode($p->name) ?>" class="product-image" onerror="this.src='<?= Url::to('@web/assets/images/parts/engine.svg') ?>'">
          
          <div class="product-badge-group">
            <?php if (!empty($p->featured)): ?>
              <span class="badge badge-featured">★ <?= $isRtl ? 'مميز' : 'Featured' ?></span>
            <?php endif; ?>
            <span class="badge badge-category"><?= Html::encode($p->category) ?></span>
          </div>
        </a>

        <div class="product-body">
          <div class="product-vendor-info">
            <span><?= Html::encode($tenantLogo) ?></span>
            <span><?= Html::encode($tenantName) ?></span>
            <span style="margin-inline-start: auto; color: #fbbf24;">★ <?= number_format($p->rating, 1) ?></span>
          </div>

          <h3 class="product-title" title="<?= Html::encode($p->name) ?>">
            <a href="<?= $productUrl ?>" style="color: inherit; text-decoration: none;">
              <?= Html::encode($p->name) ?>
            </a>
          </h3>

          <?php if (!empty($compatList) && is_array($compatList)): ?>
            <div class="product-compatibility">
              <?php foreach (array_slice($compatList, 0, 3) as $c): ?>
                <span class="compat-tag"><?= Html::encode($c) ?></span>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>

          <div class="product-footer">
            <div class="product-price">
              <span class="price-value"><?= number_format($p->price, 2) ?></span>
              <span class="price-currency"><?= $isRtl ? 'ريال سعودي (SAR)' : 'SAR' ?></span>
            </div>

            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <a href="<?= $productUrl ?>" class="btn-primary" style="padding: 0.55rem 0.75rem; font-size: 0.82rem; background: rgba(255,255,255,0.08); border: 1px solid var(--border-dark); box-shadow: none;" title="<?= $isRtl ? 'عرض تفاصيل القطعة' : 'View Details' ?>">
                <span>🔍</span>
              </a>

              <button class="btn-add-cart" onclick='Parto.addToCart(<?= json_encode([
                "id" => $p->id,
                "name" => $p->name,
                "price" => (float)$p->price,
                "image" => $p->image,
                "brand_name" => $p->brand_name,
                "tenant_id" => $p->tenant_id
              ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>)'>
                <span>🛒</span>
                <span><?= $isRtl ? 'إضافة' : 'Add' ?></span>
              </button>
            </div>
          </div>

        </div>

      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- Verified Suppliers & Market Tour Showcase -->
<section style="max-width: min(1760px, 96vw); width: 100%; margin: 0 auto 5rem; padding: 0 1.5rem;">
  <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 2.5rem; backdrop-filter: blur(12px);">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
      <div>
        <span style="color: #60a5fa; font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">
          <?= $isRtl ? 'شبكة بارتو الميدانية' : 'Verified Field Network' ?>
        </span>
        <h2 style="font-size: 1.85rem; font-weight: 900; color: #fff; margin-top: 0.25rem;">
          <?= $isRtl ? 'موزعون ووكالات ومراكز صيانة موثقة رسمياً' : 'Verified Distributors & Certified Service Centers' ?>
        </h2>
      </div>
      <a href="<?= Url::to(['/portal/index']) ?>" class="btn-primary" style="font-size: 0.9rem; padding: 0.65rem 1.25rem;">
        <span><?= $isRtl ? 'تسجيل دخول لوحة التاجر' : 'Vendor Portal Login' ?></span>
        <span>🔐</span>
      </a>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
      
      <!-- 1. Wadi Uhud Nissan -->
      <a href="<?= Url::to(['/portal/index', 'tenantId' => 't-wadi-uhud']) ?>" style="display: block; text-decoration: none; background: rgba(0,0,0,0.35); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark); transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--border-dark)'; this.style.transform='none'">
        <div style="position: relative; height: 160px; overflow: hidden;">
          <img src="<?= Url::to('@web/assets/images/vendors/Wadi Uhud for Nissan OEM Parts.webp') ?>" alt="Wadi Uhud Nissan" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
          <div style="position: absolute; bottom: 8px; <?= $isRtl ? 'right: 8px;' : 'left: 8px;' ?> background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.72rem; color: #60a5fa; font-weight: 700; border: 1px solid rgba(96,165,250,0.3); display: flex; align-items: center; gap: 0.35rem;">
            <span>🔐</span>
            <span><?= $isRtl ? 'دخول لوحة التاجر ↗' : 'Vendor Portal Login ↗' ?></span>
          </div>
        </div>
        <div style="padding: 1.1rem;">
          <h4 style="color: #fff; font-size: 0.98rem; font-weight: 800; margin-bottom: 0.25rem;">شركة وادي أحد لقطع نيسان الأصلية</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">موزع معتمد لقطع نيسان وإنفينيتي - الرياض</p>
        </div>
      </a>

      <!-- 2. Babkeer Mazda -->
      <a href="<?= Url::to(['/portal/index', 'tenantId' => 't-babkeer-mazda']) ?>" style="display: block; text-decoration: none; background: rgba(0,0,0,0.35); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark); transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--border-dark)'; this.style.transform='none'">
        <div style="position: relative; height: 160px; overflow: hidden;">
          <img src="<?= Url::to('@web/assets/images/vendors/babkeer-mazda -parts.webp') ?>" alt="Babkeer Mazda" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
          <div style="position: absolute; bottom: 8px; <?= $isRtl ? 'right: 8px;' : 'left: 8px;' ?> background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.72rem; color: #60a5fa; font-weight: 700; border: 1px solid rgba(96,165,250,0.3); display: flex; align-items: center; gap: 0.35rem;">
            <span>🔐</span>
            <span><?= $isRtl ? 'دخول لوحة التاجر ↗' : 'Vendor Portal Login ↗' ?></span>
          </div>
        </div>
        <div style="padding: 1.1rem;">
          <h4 style="color: #fff; font-size: 0.98rem; font-weight: 800; margin-bottom: 0.25rem;">مجموعة بابكير لقطع مازدا</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">وكيل موزع ومعتمد لقطع مازدا وسوبارو</p>
        </div>
      </a>

      <!-- 3. El-Shafie Auto Electrical & AC -->
      <a href="<?= Url::to(['/portal/index', 'tenantId' => 't-el-shafie']) ?>" style="display: block; text-decoration: none; background: rgba(0,0,0,0.35); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark); transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--border-dark)'; this.style.transform='none'">
        <div style="position: relative; height: 160px; overflow: hidden;">
          <img src="<?= Url::to('@web/assets/images/vendors/el-shafie.png') ?>" alt="El Shafie" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
          <div style="position: absolute; bottom: 8px; <?= $isRtl ? 'right: 8px;' : 'left: 8px;' ?> background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.72rem; color: #60a5fa; font-weight: 700; border: 1px solid rgba(96,165,250,0.3); display: flex; align-items: center; gap: 0.35rem;">
            <span>🔐</span>
            <span><?= $isRtl ? 'دخول لوحة التاجر ↗' : 'Vendor Portal Login ↗' ?></span>
          </div>
        </div>
        <div style="padding: 1.1rem;">
          <h4 style="color: #fff; font-size: 0.98rem; font-weight: 800; margin-bottom: 0.25rem;">شركة الشافعي لقطع الغيار</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">مستورد مباشر لكهرباء وميكانيكا تويوتا ولكزس</p>
        </div>
      </a>

      <!-- 4. Hamzah Sadiq Japanese Suspension -->
      <a href="<?= Url::to(['/portal/index', 'tenantId' => 't-hamzah-sadiq']) ?>" style="display: block; text-decoration: none; background: rgba(0,0,0,0.35); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark); transition: transform 0.2s, border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--border-dark)'; this.style.transform='none'">
        <div style="position: relative; height: 160px; overflow: hidden;">
          <img src="<?= Url::to('@web/assets/images/vendors/hamzah-sadiq-for-auto-parts.webp') ?>" alt="Hamzah Sadiq" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
          <div style="position: absolute; bottom: 8px; <?= $isRtl ? 'right: 8px;' : 'left: 8px;' ?> background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.72rem; color: #60a5fa; font-weight: 700; border: 1px solid rgba(96,165,250,0.3); display: flex; align-items: center; gap: 0.35rem;">
            <span>🔐</span>
            <span><?= $isRtl ? 'دخول لوحة التاجر ↗' : 'Vendor Portal Login ↗' ?></span>
          </div>
        </div>
        <div style="padding: 1.1rem;">
          <h4 style="color: #fff; font-size: 0.98rem; font-weight: 800; margin-bottom: 0.25rem;">حمزة صادق لقطع السيارات</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">متخصص في المساعدات وأنظمة التعليق اليابانية</p>
        </div>
      </a>

    </div>
  </div>
</section>
