<?php
require_once __DIR__ . '/config/db.php';
global $isRtl, $currentLang;

$productId = $_GET['id'] ?? '';
$db = getDB();

$product = null;
if (!empty($productId)) {
    $stmt = $db->prepare("SELECT p.*, t.name as tenant_name, t.logo as tenant_logo, t.phone as tenant_phone, 
                                 t.rating as tenant_rating, t.warehouse_address as tenant_address, 
                                 t.subdomain as tenant_subdomain, t.business_type as tenant_type 
                          FROM products p 
                          LEFT JOIN tenants t ON p.tenant_id = t.id 
                          WHERE p.id = :id AND p.status = 'active' 
                          LIMIT 1");
    $stmt->execute([':id' => $productId]);
    $product = $stmt->fetch();
}

// Fallback if not found: try to get the first active product if ID was empty
if (!$product && empty($productId)) {
    $product = $db->query("SELECT p.*, t.name as tenant_name, t.logo as tenant_logo, t.phone as tenant_phone, 
                                  t.rating as tenant_rating, t.warehouse_address as tenant_address, 
                                  t.subdomain as tenant_subdomain, t.business_type as tenant_type 
                           FROM products p 
                           LEFT JOIN tenants t ON p.tenant_id = t.id 
                           WHERE p.status = 'active' 
                           ORDER BY p.featured DESC LIMIT 1")->fetch();
}

$activeNav = 'product';

if ($product) {
    $pageTitle = e($product['name']) . ' | ' . ($isRtl ? 'بارتو السعودية' : 'PARTO Saudi Arabia');
    $compatList = !empty($product['compatibility']) ? json_decode($product['compatibility'], true) : [];
    
    // Fetch related products
    $relatedStmt = $db->prepare("SELECT p.*, t.name as tenant_name, t.logo as tenant_logo 
                                 FROM products p 
                                 LEFT JOIN tenants t ON p.tenant_id = t.id 
                                 WHERE p.status = 'active' AND p.id != :id AND (p.category = :cat OR p.brand_name = :brand)
                                 LIMIT 4");
    $relatedStmt->execute([
        ':id' => $product['id'],
        ':cat' => $product['category'],
        ':brand' => $product['brand_name']
    ]);
    $relatedProducts = $relatedStmt->fetchAll();
} else {
    $pageTitle = $isRtl ? 'القطعة غير متوفرة | بارتو السعودية' : 'Part Not Found | PARTO Saudi Arabia';
}

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 1360px; margin: 1.5rem auto 4rem; padding: 0 1.5rem;">

  <?php if (!$product): ?>
    <!-- Product Not Found Notice -->
    <div class="search-card" style="max-width: 600px; margin: 4rem auto; padding: 3rem 2rem; text-align: center;">
      <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔍</div>
      <h2 style="font-size: 1.85rem; font-weight: 900; color: #fff; margin-bottom: 0.75rem;">
        <?= $isRtl ? 'عذراً، لم يتم العثور على هذه القطعة' : 'Sorry, Part Not Found' ?>
      </h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">
        <?= $isRtl ? 'ربما تم بيع هذه القطعة أو تم نقلها. تفضل بالبحث برقم الهيكل أو تصفح المتجر الرئيسي.' : 'This part may be sold out or unavailable. Try searching by VIN or browse our main catalog.' ?>
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <a href="index.php" class="btn-primary" style="padding: 0.85rem 1.75rem;">
          <span><?= $isRtl ? 'العودة للمتجر الرئيسي' : 'Return to Catalog' ?></span>
        </a>
      </div>
    </div>
  <?php else: ?>

    <!-- Breadcrumb Navigation -->
    <nav style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-wrap: wrap;">
      <a href="index.php" style="color: var(--text-secondary); text-decoration: none;"><?= $isRtl ? 'الرئيسية' : 'Home' ?></a>
      <span>›</span>
      <a href="index.php" style="color: var(--text-secondary); text-decoration: none;"><?= e($product['category']) ?></a>
      <span>›</span>
      <span style="color: #60a5fa; font-weight: 600;"><?= e($product['brand_name']) ?></span>
      <span>›</span>
      <span style="color: #fff; font-weight: 700; max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><?= e($product['name']) ?></span>
    </nav>

    <!-- Main Product Showcase Grid (2 Columns) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2.5rem; margin-bottom: 3.5rem;">
      
      <!-- Column 1: Image Showcase & Guarantee Badges -->
      <div>
        <div style="background: linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid var(--border-dark); border-radius: var(--radius-2xl); padding: 2.5rem 1.5rem; text-align: center; position: relative; overflow: hidden; backdrop-filter: blur(12px);">
          
          <!-- Badges top bar -->
          <div style="position: absolute; top: 16px; right: 16px; display: flex; gap: 0.5rem; z-index: 2;">
            <?php if (!empty($product['featured'])): ?>
              <span class="badge badge-featured">★ <?= $isRtl ? 'قطعة مميزة' : 'Featured Part' ?></span>
            <?php endif; ?>
            <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">
              <?= $isRtl ? 'أصلي 100% وكالة' : '100% Genuine OEM' ?>
            </span>
          </div>

          <!-- Product Image -->
          <div style="height: 340px; display: flex; align-items: center; justify-content: center; margin-top: 1rem;">
            <img src="<?= e($product['image']) ?>" alt="<?= e($product['name']) ?>" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.5));" onerror="this.src='assets/images/parts/engine.svg'">
          </div>

          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 1.25rem;">
            🔍 <?= $isRtl ? 'صورة مطابقة للقطعة الأصلية مع تغليف المصنع' : 'Factory sealed authentic component representation' ?>
          </div>
        </div>

        <!-- Trust Badges & Policies -->
        <div style="margin-top: 1.25rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 1.3rem;">🛡️</span>
            <div>
              <div style="font-size: 0.82rem; font-weight: 800; color: #fff;"><?= $isRtl ? 'ضمان وكالة شامل' : '1-Year Warranty' ?></div>
              <div style="font-size: 0.72rem; color: var(--text-muted);"><?= $isRtl ? 'ضمان الجودة ضد العيوب' : 'Factory defect coverage' ?></div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 1.3rem;">🚚</span>
            <div>
              <div style="font-size: 0.82rem; font-weight: 800; color: #fff;"><?= $isRtl ? 'شحن فوري سمسا/سُبل' : 'Express Delivery' ?></div>
              <div style="font-size: 0.72rem; color: var(--text-muted);"><?= $isRtl ? 'خلال 24-48 ساعة لبابك' : '1-2 business days' ?></div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 1.3rem;">🔄</span>
            <div>
              <div style="font-size: 0.82rem; font-weight: 800; color: #fff;"><?= $isRtl ? 'استرجاع مجاني 14 يوم' : '14-Day Free Return' ?></div>
              <div style="font-size: 0.72rem; color: var(--text-muted);"><?= $isRtl ? 'مطابقة تامة أو استرجاع' : 'Hassle-free guarantee' ?></div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 0.85rem; display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 1.3rem;">💳</span>
            <div>
              <div style="font-size: 0.82rem; font-weight: 800; color: #fff;"><?= $isRtl ? 'مدى و Apple Pay' : 'Mada & Apple Pay' ?></div>
              <div style="font-size: 0.72rem; color: var(--text-muted);"><?= $isRtl ? 'دفع إلكتروني آمن 100%' : 'Encrypted checkout' ?></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2: Product Info, Price, Compatibility & Order Actions -->
      <div>
        
        <!-- Brand & Category Row -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem;">
          <span style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 800; text-transform: uppercase;">
            <?= e($product['brand_name']) ?> Genuine
          </span>
          <span style="color: #fbbf24; font-weight: 800; font-size: 0.92rem; display: flex; align-items: center; gap: 0.25rem;">
            <span>★</span>
            <span><?= number_format($product['rating'], 2) ?></span>
            <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 400;">(<?= $isRtl ? 'تقييم موثق' : 'verified' ?>)</span>
          </span>
        </div>

        <!-- Product Name -->
        <h1 style="font-size: 1.85rem; font-weight: 900; color: #fff; line-height: 1.3; margin-bottom: 1rem;">
          <?= e($product['name']) ?>
        </h1>

        <!-- OEM Part Number Bar -->
        <?php if (!empty($product['oem_part_number'])): ?>
          <div style="display: flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-md); padding: 0.65rem 1rem; margin-bottom: 1.25rem; width: fit-content;">
            <span style="font-size: 0.82rem; color: var(--text-muted);"><?= $isRtl ? 'رقم القطعة الأصلي (OEM):' : 'OEM Part Number:' ?></span>
            <code style="font-family: monospace; font-size: 0.95rem; font-weight: 800; color: #38bdf8;" id="oemPartCode"><?= e($product['oem_part_number']) ?></code>
            <button type="button" onclick="copyPartNumber()" class="btn-icon" style="width: 28px; height: 28px; font-size: 0.75rem;" title="<?= $isRtl ? 'نسخ رقم القطعة' : 'Copy Part Number' ?>">
              📋
            </button>
            <span id="copyFeedback" style="font-size: 0.75rem; color: #34d399; display: none;"><?= $isRtl ? 'تم النسخ!' : 'Copied!' ?></span>
          </div>
        <?php endif; ?>

        <!-- Price Section -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span style="font-size: 2.3rem; font-weight: 900; color: #38bdf8; font-family: var(--font-display);">
              <?= number_format((float)$product['price'], 2) ?>
            </span>
            <span style="font-size: 1.05rem; font-weight: 800; color: #fff;">
              <?= $isRtl ? 'ريال سعودي (SAR)' : 'SAR' ?>
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.85rem;">
            <span style="color: #34d399; font-weight: 700;">✓ <?= $isRtl ? 'السعر شامل ضريبة القيمة المضافة (15%)' : 'Price includes 15% VAT' ?></span>
            <span style="color: var(--text-muted);">•</span>
            <span style="color: #60a5fa; font-weight: 600;">
              <?= $isRtl ? 'متوفر بالمستودع (' . (int)$product['stock_quantity'] . ' قطعة)' : 'In Stock (' . (int)$product['stock_quantity'] . ' units)' ?>
            </span>
          </div>
        </div>

        <!-- Description -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">
            <?= $isRtl ? 'وصف القطعة والمواصفات الميكانيكية:' : 'Part Description & Engineering Notes:' ?>
          </h4>
          <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.92rem;">
            <?= nl2br(e($product['description'])) ?>
          </p>
        </div>

        <!-- Vehicle Compatibility Pills -->
        <?php if (!empty($compatList) && is_array($compatList)): ?>
          <div style="margin-bottom: 1.75rem;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>🚘</span>
              <span><?= $isRtl ? 'مطابقة وتوافق المركبات المعتمدة:' : 'Verified Vehicle Fitment:' ?></span>
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
              <?php foreach ($compatList as $c): ?>
                <span style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-dark); border-radius: var(--radius-full); padding: 0.35rem 0.85rem; font-size: 0.82rem; font-weight: 700; color: #e2e8f0;">
                  <?= e($c) ?>
                </span>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endif; ?>

        <!-- Quantity & Purchase Actions -->
        <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 1.5rem;">
          
          <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.25rem;">
            <span style="font-size: 0.9rem; font-weight: 700; color: #fff;"><?= $isRtl ? 'الكمية المطلوبة:' : 'Quantity:' ?></span>
            <div style="display: flex; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid var(--border-dark); border-radius: var(--radius-md); overflow: hidden;">
              <button type="button" onclick="decrementQty()" style="background: transparent; border: none; color: #fff; width: 36px; height: 36px; font-size: 1.1rem; cursor: pointer;">-</button>
              <input type="number" id="purchaseQty" value="1" min="1" max="<?= (int)$product['stock_quantity'] ?>" style="width: 50px; height: 36px; background: transparent; border: none; text-align: center; color: #fff; font-weight: 800; font-size: 1rem;" readonly>
              <button type="button" onclick="incrementQty()" style="background: transparent; border: none; color: #fff; width: 36px; height: 36px; font-size: 1.1rem; cursor: pointer;">+</button>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              <?= $isRtl ? 'أقصى كمية متاحة: ' . (int)$product['stock_quantity'] : 'Max units: ' . (int)$product['stock_quantity'] ?>
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <button type="button" class="btn-primary" style="padding: 1rem; justify-content: center; font-size: 1rem;" onclick="addCurrentProductToCart()">
              <span>🛒 <?= $isRtl ? 'إضافة إلى السلة' : 'Add to Cart' ?></span>
            </button>

            <button type="button" class="btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 1rem; justify-content: center; font-size: 1rem; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);" onclick="buyCurrentProductNow()">
              <span>⚡ <?= $isRtl ? 'شراء ودفع فوري' : 'Buy Now' ?></span>
            </button>
          </div>

        </div>

        <!-- Vendor Profile Card -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              <?= e($product['tenant_logo'] ?: '🏪') ?>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">
                <?= $isRtl ? 'الموزع المعتمد الموثق' : 'Verified Distributor' ?>
              </div>
              <div style="font-size: 1rem; font-weight: 800; color: #fff;">
                <?= e($product['tenant_name'] ?: 'Riyadh OEM Parts Co.') ?>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">
                📍 <?= e($product['tenant_address'] ?: 'الرياض - المنطقة الصناعية المركزية') ?>
              </div>
            </div>
          </div>

          <a href="portal.php?tenantId=<?= urlencode($product['tenant_id']) ?>" class="btn-primary" style="padding: 0.55rem 1rem; font-size: 0.82rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border-dark); box-shadow: none;">
            <span><?= $isRtl ? 'متجر الموزع ↗' : 'Vendor Portal ↗' ?></span>
          </a>
        </div>

      </div>

    </div>

    <!-- Technical Specifications Table -->
    <section style="margin-bottom: 4rem;">
      <h3 style="font-size: 1.35rem; font-weight: 900; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>📐</span>
        <span><?= $isRtl ? 'جدول المواصفات الفنية والمقاييس' : 'Technical Specifications' ?></span>
      </h3>

      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: <?= $isRtl ? 'right' : 'left' ?>; font-size: 0.92rem;">
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-dark);">
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); width: 35%; font-weight: 600;"><?= $isRtl ? 'رقم القطعة الأصلي (OEM Part Number)' : 'OEM Part Number' ?></td>
              <td style="padding: 1rem 1.5rem; color: #fff; font-weight: 800; font-family: monospace;"><?= e($product['oem_part_number'] ?: 'N/A') ?></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-dark); background: rgba(255,255,255,0.015);">
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 600;"><?= $isRtl ? 'الشركة المصنعة / العلامة' : 'Manufacturer Brand' ?></td>
              <td style="padding: 1rem 1.5rem; color: #fff; font-weight: 700;"><?= e($product['brand_name']) ?> Genuine Parts</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-dark);">
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 600;"><?= $isRtl ? 'تصنيف القطعة' : 'Part Category' ?></td>
              <td style="padding: 1rem 1.5rem; color: #fff; font-weight: 700;"><?= e($product['category']) ?></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-dark); background: rgba(255,255,255,0.015);">
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 600;"><?= $isRtl ? 'الحالة والجودة' : 'Condition' ?></td>
              <td style="padding: 1rem 1.5rem; color: #34d399; font-weight: 700;">
                <?= $isRtl ? 'جديد كلياً 100% أصلي معتمد بتغليف المصنع' : '100% Brand New Genuine Factory Sealed' ?>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-dark);">
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 600;"><?= $isRtl ? 'الوزن التقريبي للشحنة' : 'Shipping Weight' ?></td>
              <td style="padding: 1rem 1.5rem; color: #fff; font-weight: 700;"><?= number_format((float)($product['weight'] ?? 1.5), 2) ?> kg</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-dark); background: rgba(255,255,255,0.015);">
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 600;"><?= $isRtl ? 'أبعاد الشحنة (طول × عرض × ارتفاع)' : 'Dimensions (L × W × H)' ?></td>
              <td style="padding: 1rem 1.5rem; color: #fff; font-weight: 700;">
                <?= (float)($product['length'] ?? 20) ?> × <?= (float)($product['width'] ?? 15) ?> × <?= (float)($product['height'] ?? 10) ?> cm
              </td>
            </tr>
            <tr>
              <td style="padding: 1rem 1.5rem; color: var(--text-muted); font-weight: 600;"><?= $isRtl ? 'سياسة الضمان' : 'Warranty Terms' ?></td>
              <td style="padding: 1rem 1.5rem; color: #fff; font-weight: 700;">
                <?= $isRtl ? 'ضمان 12 شهراً ضد أي عيب مصنعي لدى شبكة الموزع المعتمد' : '12-Month Official Distributor Warranty against manufacturing defects' ?>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Related Products Showcase -->
    <?php if (!empty($relatedProducts)): ?>
      <section>
        <div class="section-header" style="margin-bottom: 1.5rem;">
          <h3 class="section-title">
            <span>📦</span>
            <span><?= $isRtl ? 'قطع غيار ذات صلة قد تحتاجها' : 'Related Compatible Spare Parts' ?></span>
          </h3>
          <a href="index.php" style="color: #60a5fa; font-size: 0.88rem; font-weight: 700; text-decoration: none;">
            <?= $isRtl ? 'تصفح كل القطع ←' : 'Browse All Parts →' ?>
          </a>
        </div>

        <div class="products-grid">
          <?php foreach ($relatedProducts as $rp): ?>
            <div class="product-card">
              <a href="product.php?id=<?= urlencode($rp['id']) ?>" class="product-image-container" style="text-decoration: none;">
                <img src="<?= e($rp['image']) ?>" alt="<?= e($rp['name']) ?>" class="product-image" onerror="this.src='assets/images/parts/engine.svg'">
                <div class="product-badge-group">
                  <span class="badge badge-category"><?= e($rp['category']) ?></span>
                </div>
              </a>

              <div class="product-body">
                <div class="product-vendor-info">
                  <span><?= e($rp['tenant_logo'] ?: '🏪') ?></span>
                  <span><?= e($rp['tenant_name'] ?: 'PARTO Vendor') ?></span>
                </div>

                <h4 class="product-title" title="<?= e($rp['name']) ?>">
                  <a href="product.php?id=<?= urlencode($rp['id']) ?>" style="color: inherit; text-decoration: none;">
                    <?= e($rp['name']) ?>
                  </a>
                </h4>

                <div class="product-footer">
                  <div class="product-price">
                    <span class="price-value"><?= number_format((float)$rp['price'], 2) ?></span>
                    <span class="price-currency"><?= $isRtl ? 'ر.س' : 'SAR' ?></span>
                  </div>

                  <a href="product.php?id=<?= urlencode($rp['id']) ?>" class="btn-primary" style="padding: 0.45rem 0.85rem; font-size: 0.82rem;">
                    <span><?= $isRtl ? 'التفاصيل' : 'View' ?></span>
                  </a>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>

  <?php endif; ?>

</div>

<script>
const currentProductData = <?= json_encode([
  "id" => $product["id"] ?? "",
  "name" => $product["name"] ?? "",
  "price" => (float)($product["price"] ?? 0),
  "image" => $product["image"] ?? "",
  "brand_name" => $product["brand_name"] ?? "",
  "tenant_id" => $product["tenant_id"] ?? ""
], JSON_HEX_APOS | JSON_HEX_QUOT) ?>;

function incrementQty() {
  const input = document.getElementById('purchaseQty');
  const max = parseInt(input.max) || 99;
  let val = parseInt(input.value) || 1;
  if (val < max) {
    input.value = val + 1;
  }
}

function decrementQty() {
  const input = document.getElementById('purchaseQty');
  let val = parseInt(input.value) || 1;
  if (val > 1) {
    input.value = val - 1;
  }
}

function addCurrentProductToCart() {
  const qty = parseInt(document.getElementById('purchaseQty')?.value) || 1;
  for (let i = 0; i < qty; i++) {
    Parto.addToCart(currentProductData);
  }
  Parto.openCartDrawer();
}

function buyCurrentProductNow() {
  const qty = parseInt(document.getElementById('purchaseQty')?.value) || 1;
  for (let i = 0; i < qty; i++) {
    Parto.addToCart(currentProductData);
  }
  window.location.href = 'checkout.php';
}

function copyPartNumber() {
  const code = document.getElementById('oemPartCode')?.textContent.trim();
  if (code && navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      const fb = document.getElementById('copyFeedback');
      if (fb) {
        fb.style.display = 'inline';
        setTimeout(() => fb.style.display = 'none', 2500);
      }
    });
  }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
