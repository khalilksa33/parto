<?php
$pageTitle = 'بارتو السعودية | سوق قطع غيار السيارات والخدمات المتكاملة';
$activeNav = 'home';
require_once __DIR__ . '/config/db.php';
global $isRtl, $currentLang;

// Fetch active products from DB
$db = getDB();
$stmt = $db->query("SELECT p.*, t.name as tenant_name, t.logo as tenant_logo, t.subdomain as tenant_subdomain 
                    FROM products p 
                    LEFT JOIN tenants t ON p.tenant_id = t.id 
                    WHERE p.status = 'active' 
                    ORDER BY p.featured DESC, p.created_at DESC");
$products = $stmt->fetchAll();

// Vehicle Brands
$popularBrands = [
    ['name' => 'Toyota', 'logo' => 'https://cdn.worldvectorlogo.com/logos/toyota-3.svg', 'alt' => 'Toyota'],
    ['name' => 'Nissan', 'logo' => 'https://cdn.worldvectorlogo.com/logos/nissan-6.svg', 'alt' => 'Nissan'],
    ['name' => 'Hyundai', 'logo' => 'https://cdn.worldvectorlogo.com/logos/hyundai-1.svg', 'alt' => 'Hyundai'],
    ['name' => 'Lexus', 'logo' => 'assets/images/brands/lexus.svg', 'alt' => 'Lexus'],
    ['name' => 'Kia', 'logo' => 'assets/images/brands/kia.svg', 'alt' => 'Kia'],
    ['name' => 'Ford', 'logo' => 'https://cdn.worldvectorlogo.com/logos/ford-8.svg', 'alt' => 'Ford'],
    ['name' => 'Chevrolet', 'logo' => 'https://cdn.worldvectorlogo.com/logos/chevrolet.svg', 'alt' => 'Chevrolet'],
    ['name' => 'Mazda', 'logo' => 'https://cdn.worldvectorlogo.com/logos/mazda.svg', 'alt' => 'Mazda'],
    ['name' => 'BMW', 'logo' => 'assets/images/brands/bmw.svg', 'alt' => 'BMW'],
    ['name' => 'Audi', 'logo' => 'assets/images/brands/audi.svg', 'alt' => 'Audi'],
    ['name' => 'Mercedes', 'logo' => 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg', 'alt' => 'Mercedes']
];

// Categories
$categories = [
    'all' => ($isRtl ? 'جميع الأقسام' : 'All Categories'),
    'Engine Parts' => ($isRtl ? 'أجزاء المحرك' : 'Engine Parts'),
    'Brakes & Suspension' => ($isRtl ? 'الفرامل والمساعدات' : 'Brakes & Suspension'),
    'Transmission' => ($isRtl ? 'ناقل الحركة (القير)' : 'Transmission'),
    'Exterior & Body' => ($isRtl ? 'البودي والهيكل الخارجي' : 'Body & Exterior'),
    'Electrical & Sensors' => ($isRtl ? 'الكهرباء والحساسات' : 'Electrical & Sensors'),
    'Towing & Recovery' => ($isRtl ? 'سطحات وطوارئ' : 'Towing & Recovery'),
];

require_once __DIR__ . '/includes/header.php';
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
      <span class="gradient-text"><?= $isRtl ? 'قطع غيار أصلية، تشليح، وسطحات فورية' : 'OEM Parts, Tashleeh & Towing' ?></span>
    </h1>

    <p class="hero-subtitle">
      <?= $isRtl 
        ? 'ابحث برقم الهيكل (VIN) أو اسم القطعة، وقارن أسعار البائعين وساحات التشليح المعتمدة في الرياض وجدة وكافة أنحاء المملكة.' 
        : 'Search by VIN or part name. Compare prices across certified distributors and salvage yards in seconds.' ?>
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
      <div class="brand-card" data-brand="<?= e($b['name']) ?>">
        <img src="<?= e($b['logo']) ?>" alt="<?= e($b['name']) ?>" class="brand-logo-img" loading="lazy">
        <span class="brand-name"><?= e($b['name']) ?></span>
      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- Category Filter Pills -->
<div class="categories-bar">
  <?php foreach ($categories as $catKey => $catLabel): ?>
    <button class="category-pill <?= $catKey === 'all' ? 'active' : '' ?>" data-category="<?= e($catKey) ?>">
      <?= e($catLabel) ?>
    </button>
  <?php endforeach; ?>
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
        $compatList = !empty($p['compatibility']) ? json_decode($p['compatibility'], true) : [];
      ?>
      <div class="product-card" data-brand="<?= e($p['brand_name']) ?>" data-category="<?= e($p['category']) ?>">
        
        <div class="product-image-container">
          <img src="<?= e($p['image']) ?>" alt="<?= e($p['name']) ?>" class="product-image" onerror="this.src='assets/images/parts/engine.svg'">
          
          <div class="product-badge-group">
            <?php if (!empty($p['featured'])): ?>
              <span class="badge badge-featured">★ <?= $isRtl ? 'مميز' : 'Featured' ?></span>
            <?php endif; ?>
            <span class="badge badge-category"><?= e($p['category']) ?></span>
          </div>
        </div>

        <div class="product-body">
          <div class="product-vendor-info">
            <span><?= e($p['tenant_logo'] ?: '🏪') ?></span>
            <span><?= e($p['tenant_name'] ?: 'Riyadh OEM Parts') ?></span>
            <span style="margin-inline-start: auto; color: #fbbf24;">★ <?= number_format($p['rating'], 1) ?></span>
          </div>

          <h3 class="product-title" title="<?= e($p['name']) ?>">
            <?= e($p['name']) ?>
          </h3>

          <?php if (!empty($compatList) && is_array($compatList)): ?>
            <div class="product-compatibility">
              <?php foreach (array_slice($compatList, 0, 3) as $c): ?>
                <span class="compat-tag"><?= e($c) ?></span>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>

          <div class="product-footer">
            <div class="product-price">
              <span class="price-value"><?= number_format($p['price'], 2) ?></span>
              <span class="price-currency"><?= $isRtl ? 'ريال سعودي (SAR)' : 'SAR' ?></span>
            </div>

            <button class="btn-add-cart" onclick='Parto.addToCart(<?= json_encode([
              "id" => $p["id"],
              "name" => $p["name"],
              "price" => (float)$p["price"],
              "image" => $p["image"],
              "brand_name" => $p["brand_name"],
              "tenant_id" => $p["tenant_id"]
            ], JSON_HEX_APOS | JSON_HEX_QUOT) ?>)'>
              <span>🛒</span>
              <span><?= $isRtl ? 'إضافة للسلة' : 'Add' ?></span>
            </button>
          </div>

        </div>

      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- Verified Suppliers & Market Tour Showcase -->
<section style="max-width: 1360px; margin: 0 auto 5rem; padding: 0 1.5rem;">
  <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 2.5rem; backdrop-filter: blur(12px);">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
      <div>
        <span style="color: #60a5fa; font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">
          <?= $isRtl ? 'شبكة بارتو الميدانية' : 'Verified Field Network' ?>
        </span>
        <h2 style="font-size: 1.85rem; font-weight: 900; color: #fff; margin-top: 0.25rem;">
          <?= $isRtl ? 'موزعون ووكالات ومحلات تشليح موثقة رسمياً' : 'Verified Distributors & Scrap Yards' ?>
        </h2>
      </div>
      <a href="register.php" class="btn-primary" style="font-size: 0.9rem; padding: 0.65rem 1.25rem;">
        <span><?= $isRtl ? 'انضم كبائع معتمد' : 'Join as Verified Vendor' ?></span>
      </a>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem;">
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark);">
        <img src="assets/images/vendors/Wadi Uhud for Nissan OEM Parts.webp" alt="Wadi Uhud Nissan" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.style.display='none'">
        <div style="padding: 1rem;">
          <h4 style="color: #fff; font-size: 0.95rem; font-weight: 800;">شركة وادي أحد لقطع نيسان الأصلية</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">موزع معتمد لقطع نيسان وإنفينيتي - الرياض</p>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark);">
        <img src="assets/images/vendors/babkeer-mazda -parts.webp" alt="Babkeer Mazda" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.style.display='none'">
        <div style="padding: 1rem;">
          <h4 style="color: #fff; font-size: 0.95rem; font-weight: 800;">مجموعة بابكير لقطع مازدا</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">وكيل موزع ومعتمد لقطع مازدا وسوبارو</p>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark);">
        <img src="assets/images/vendors/el-shafie.png" alt="El Shafie" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.style.display='none'">
        <div style="padding: 1rem;">
          <h4 style="color: #fff; font-size: 0.95rem; font-weight: 800;">شركة الشافعي لقطع الغيار</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">مستورد مباشر لكهرباء وميكانيكا تويوتا ولكزس</p>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-dark);">
        <img src="assets/images/vendors/hamzah-sadiq-for-auto-parts.webp" alt="Hamzah Sadiq" style="width: 100%; height: 160px; object-fit: cover;" onerror="this.style.display='none'">
        <div style="padding: 1rem;">
          <h4 style="color: #fff; font-size: 0.95rem; font-weight: 800;">حمزة صادق لقطع السيارات</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">متخصص في المساعدات وأنظمة التعليق اليابانية</p>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
