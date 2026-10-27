<?php

/** @var yii\web\View $this */
/** @var string $content */

use yii\helpers\Html;
use yii\helpers\Url;

$isRtl = Yii::$app->language === 'ar';
$activeController = Yii::$app->controller ? Yii::$app->controller->id : 'site';
$activeAction = (Yii::$app->controller && Yii::$app->controller->action) ? Yii::$app->controller->action->id : 'index';

$currentRoute = Yii::$app->requestedRoute ?: (Yii::$app->controller ? Yii::$app->controller->route : 'site/index');
$queryParams = Yii::$app->request->getQueryParams();
$arUrl = Url::to(array_merge(['/' . ltrim($currentRoute, '/')], $queryParams, ['lang' => 'ar']));
$enUrl = Url::to(array_merge(['/' . ltrim($currentRoute, '/')], $queryParams, ['lang' => 'en']));
$homeUrl = Url::to(array_merge(['/'], $isRtl ? [] : ['lang' => 'en']));



$navTitles = [
    'site'     => ['ar' => 'بارتو السعودية | سوق قطع غيار السيارات والخدمات المتكاملة', 'en' => 'PARTO Saudi Arabia | Auto Spare Parts & Automotive Hub'],
    'product'  => ['ar' => 'تفاصيل قطعة الغيار الأصلية | بارتو السعودية', 'en' => 'Genuine Auto Part Details | PARTO Saudi Arabia'],
    'checkout' => ['ar' => 'إتمام الطلب والدفع الآمن | بارتو السعودية', 'en' => 'Secure Checkout & Delivery | PARTO Saudi Arabia'],
    'portal'   => ['ar' => 'لوحة تحكم البائع والتاجر | بارتو السعودية', 'en' => 'Vendor Management Portal | PARTO Saudi Arabia'],
    'workshop' => ['ar' => 'ورش صيانة السيارات والورش المتنقلة | بارتو السعودية', 'en' => 'Auto Repair Workshops & Mobile Mechanics | PARTO Saudi Arabia'],
    'towing'   => ['ar' => 'سطحات وسحب مركبات فوري 24/7 | بارتو السعودية', 'en' => 'Emergency Towing & Satha Dispatch 24/7 | PARTO Saudi Arabia'],
    'oem'      => ['ar' => 'كتالوج قطع غيار الوكالة والأرقام الأصلية | بارتو السعودية', 'en' => 'OEM Fitment Catalog & Genuine Part Numbers | PARTO Saudi Arabia'],
];

if (empty($this->title)) {
    $this->title = $navTitles[$activeController][$isRtl ? 'ar' : 'en'] ?? ($isRtl ? 'بارتو السعودية' : 'PARTO Saudi Arabia');
}

$this->beginPage();
?>
<!DOCTYPE html>
<html lang="<?= Html::encode(Yii::$app->language) ?>" dir="<?= $isRtl ? 'rtl' : 'ltr' ?>" data-theme="dark">
<head>
  <meta charset="<?= Yii::$app->charset ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title><?= Html::encode($this->title) ?></title>
  <meta name="description" content="<?= $isRtl ? 'منصة بارتو السعودية لقطع غيار السيارات الأصلية والورش المعتمدة وسطحات السحب الفورية.' : 'PARTO - Saudi Arabia Premier Automotive Marketplace for genuine OEM auto parts, certified workshops, and emergency towing dispatch.' ?>">
  <link rel="icon" type="image/png" href="<?= Url::to('@web/assets/images/logo.png') ?>">
  <link rel="stylesheet" href="<?= Url::to('@web/assets/css/style.css') ?>">
  <?php $this->head() ?>
</head>
<body>
<?php $this->beginBody() ?>

  <!-- Navigation Bar -->
  <header class="navbar">
    <div class="nav-container">

      <!-- Brand Logo -->
      <a href="<?= $homeUrl ?>" class="brand-logo" title="PARTO">
        <img src="<?= Url::to('@web/assets/images/logo.png') ?>" alt="PARTO Logo" onerror="this.src='<?= Url::to('@web/assets/images/logo.jpg') ?>'">
        <span class="brand-badge"><?= $isRtl ? 'السعودية' : 'KSA' ?></span>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="desktop-nav">
        <ul class="nav-links">
          <li class="nav-item <?= $activeController === 'site' && $activeAction === 'index' ? 'active' : '' ?>">
            <a href="<?= $homeUrl ?>">
              <span>🏠</span>
              <span><?= $isRtl ? 'السوق الرئيسي' : 'Marketplace' ?></span>
            </a>
          </li>
          <!-- Tashleeh (Used Parts) - Temporarily disabled for launch
          <li class="nav-item">
            <a href="#">
              <span>🚗</span>
              <span><?= $isRtl ? 'التشليح (مستعمل)' : 'Tashleeh (Used)' ?></span>
            </a>
          </li>
          -->
          <li class="nav-item <?= $activeController === 'workshop' ? 'active' : '' ?>">
            <a href="<?= Url::to(['/workshop/index']) ?>">
              <span>🔧</span>
              <span><?= $isRtl ? 'ورش الصيانة' : 'Workshops' ?></span>
            </a>
          </li>
          <li class="nav-item <?= $activeController === 'towing' ? 'active' : '' ?>">
            <a href="<?= Url::to(['/towing/index']) ?>">
              <span>🛻</span>
              <span><?= $isRtl ? 'سطحات وسحب' : 'Towing & Satha' ?></span>
            </a>
          </li>
          <li class="nav-item <?= $activeController === 'oem' ? 'active' : '' ?>">
            <a href="<?= Url::to(['/oem/index']) ?>">
              <span>📐</span>
              <span><?= $isRtl ? 'كتالوج الوكالة' : 'OEM Catalog' ?></span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Action Items: Language, Notifications, Cart, Vendor Portal -->
      <div class="nav-actions">
        
        <!-- Language Switcher -->
        <div class="lang-switch">
          <a href="<?= $arUrl ?>" class="lang-btn <?= $isRtl ? 'active' : '' ?>">عربي</a>
          <a href="<?= $enUrl ?>" class="lang-btn <?= !$isRtl ? 'active' : '' ?>">EN</a>
        </div>

        <!-- Notification Bell -->
        <button class="btn-icon" id="notifBellBtn" title="<?= $isRtl ? 'الإشعارات' : 'Notifications' ?>" onclick="toggleNotifications()">
          <span>🔔</span>
          <span class="badge-count" id="notifBadgeCount" style="display: none;">0</span>
        </button>

        <!-- Cart Trigger -->
        <button class="btn-icon" title="<?= $isRtl ? 'سلة المشتريات' : 'Shopping Cart' ?>" onclick="Parto.openCartDrawer()">
          <span>🛒</span>
          <span class="badge-count cart-badge-count" style="display: none;">0</span>
        </button>

        <!-- Vendor Dashboard CTA -->
        <a href="<?= Url::to(['/portal/index']) ?>" class="btn-vendor-portal" title="<?= $isRtl ? 'لوحة تحكم البائع والتاجر' : 'Vendor Management Portal' ?>">
          <span>🏪</span>
          <span class="vendor-btn-text"><?= $isRtl ? 'لوحة البائع' : 'Vendor Hub' ?></span>
        </a>

      </div>

    </div>
  </header>

  <!-- Mobile Navigation Drawer Overlay & Panel -->
  <div class="mobile-nav-overlay" id="mobileNavOverlay" onclick="Parto.closeMobileNav()"></div>
  <aside class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile Navigation Drawer">
    <div class="mobile-drawer-header">
      <div class="brand-logo" title="PARTO">
        <img src="<?= Url::to('@web/assets/images/logo.png') ?>" alt="PARTO Logo" onerror="this.src='<?= Url::to('@web/assets/images/logo.jpg') ?>'">
        <span class="brand-badge"><?= $isRtl ? 'السعودية' : 'KSA' ?></span>
      </div>
      <button class="btn-icon btn-drawer-close" onclick="Parto.closeMobileNav()" aria-label="Close menu">✕</button>
    </div>

    <div class="mobile-drawer-body">
      <div class="drawer-user-card">
        <div class="drawer-user-info">
          <span class="drawer-flag">🇸🇦</span>
          <div>
            <strong><?= $isRtl ? 'منصة بارتو الموحدة' : 'PARTO Unified Platform' ?></strong>
            <small><?= $isRtl ? 'الرياض • جدة • الدمام • مكة' : 'Riyadh • Jeddah • Dammam' ?></small>
          </div>
        </div>
        <div class="lang-switch">
          <a href="<?= $arUrl ?>" class="lang-btn <?= $isRtl ? 'active' : '' ?>">عربي</a>
          <a href="<?= $enUrl ?>" class="lang-btn <?= !$isRtl ? 'active' : '' ?>">EN</a>
        </div>
      </div>

      <nav class="mobile-nav-menu">
        <div class="drawer-section-title"><?= $isRtl ? 'أقسام المنصة الرئيسية' : 'Marketplace Sections' ?></div>
        <a href="<?= $homeUrl ?>" class="mobile-nav-link <?= $activeController === 'site' && $activeAction === 'index' ? 'active' : '' ?>">
          <span class="drawer-icon">🏠</span>
          <span class="drawer-title"><?= $isRtl ? 'السوق الرئيسي وقطع الغيار' : 'Spare Parts Marketplace' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="<?= Url::to(['/towing/index']) ?>" class="mobile-nav-link <?= $activeController === 'towing' ? 'active' : '' ?>">
          <span class="drawer-icon">🛻</span>
          <span class="drawer-title"><?= $isRtl ? 'سطحات وسحب فوري 24/7' : 'Emergency Towing & Satha' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="<?= Url::to(['/workshop/index']) ?>" class="mobile-nav-link <?= $activeController === 'workshop' ? 'active' : '' ?>">
          <span class="drawer-icon">🔧</span>
          <span class="drawer-title"><?= $isRtl ? 'ورش الصيانة والميكانيكي المتنقل' : 'Workshops & Mobile Mechanic' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="<?= Url::to(['/oem/index']) ?>" class="mobile-nav-link <?= $activeController === 'oem' ? 'active' : '' ?>">
          <span class="drawer-icon">📐</span>
          <span class="drawer-title"><?= $isRtl ? 'كتالوج الوكالة ومطابقة OEM' : 'OEM Fitment Catalog' ?></span>
          <span class="drawer-arrow">›</span>
        </a>

        <div class="drawer-section-title"><?= $isRtl ? 'التجار والشركاء' : 'Vendors & Operations' ?></div>
        <a href="<?= Url::to(['/portal/index']) ?>" class="mobile-nav-link <?= $activeController === 'portal' ? 'active' : '' ?>">
          <span class="drawer-icon">🏪</span>
          <span class="drawer-title"><?= $isRtl ? 'لوحة تحكم التاجر والبائع' : 'Vendor Control Hub' ?></span>
          <span class="drawer-badge"><?= $isRtl ? 'دخول' : 'Access' ?></span>
        </a>
        <a href="<?= Url::to(['/site/admin']) ?>" class="mobile-nav-link <?= $activeController === 'site' && $activeAction === 'admin' ? 'active' : '' ?>">
          <span class="drawer-icon">🛡️</span>
          <span class="drawer-title"><?= $isRtl ? 'لوحة المشرف العام' : 'Super Admin Center' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="<?= Url::to(['/site/register']) ?>" class="mobile-nav-link">
          <span class="drawer-icon">📝</span>
          <span class="drawer-title"><?= $isRtl ? 'سجل متجرك أو ورشتك كبائع معتمد' : 'Register Store / Workshop' ?></span>
          <span class="drawer-badge" style="background: rgba(16,185,129,0.2); color: #34d399;"><?= $isRtl ? 'مجاني' : 'Free' ?></span>
        </a>
      </nav>
    </div>

    <div class="mobile-drawer-footer">
      <button type="button" class="btn-primary" style="width: 100%; justify-content: center;" onclick="Parto.closeMobileNav(); Parto.openCartDrawer();">
        <span>🛒 <?= $isRtl ? 'عرض سلة المشتريات' : 'View Shopping Cart' ?></span>
      </button>
    </div>
  </aside>

  <!-- Main View Content -->
  <main class="site-main">
    <?= $content ?>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      
      <div class="footer-brand">
        <a href="<?= $homeUrl ?>" class="brand-logo" title="PARTO">
          <img src="<?= Url::to('@web/assets/images/logo.png') ?>" alt="PARTO Logo" onerror="this.src='<?= Url::to('@web/assets/images/logo.jpg') ?>'">
        </a>
        <p>
          <?= $isRtl 
            ? 'المنصة السعودية الشاملة لقطع غيار السيارات الجديدة الأصلية وخدمات السطحات والورش المعتمدة بجميع مدن المملكة العربية السعودية.' 
            : 'Saudi Arabia\'s unified digital marketplace for genuine new auto parts, 24/7 towing dispatch, and certified workshops.' ?>
        </p>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);">🇸🇦 المملكة العربية السعودية</span>
          <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #60a5fa; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);">Yii 2 Enterprise</span>
        </div>
      </div>

      <div class="footer-col">
        <h4><?= $isRtl ? 'الخدمات والأقسام' : 'Marketplace Services' ?></h4>
        <ul>
          <li><a href="<?= $homeUrl ?>"><?= $isRtl ? 'قطع غيار جديدة وموزعين' : 'New Auto Spare Parts' ?></a></li>
          <li><a href="<?= Url::to(['/workshop/index']) ?>"><?= $isRtl ? 'ورش الصيانة وميكانيكا' : 'Auto Workshops' ?></a></li>
          <li><a href="<?= Url::to(['/towing/index']) ?>"><?= $isRtl ? 'سطحات وسحب مركبات' : 'Towing & Flatbed (Satha)' ?></a></li>
          <li><a href="<?= Url::to(['/oem/index']) ?>"><?= $isRtl ? 'كتالوج وكالات وتوافقية' : 'OEM Fitment Catalog' ?></a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4><?= $isRtl ? 'الشركاء والبائعين' : 'Vendors & Partners' ?></h4>
        <ul>
          <li><a href="<?= Url::to(['/site/register']) ?>"><?= $isRtl ? 'سجّل كبائع أو موزع' : 'Register Vendor Account' ?></a></li>
          <li><a href="<?= Url::to(['/portal/index']) ?>"><?= $isRtl ? 'لوحة تحكم التاجر' : 'Vendor Portal Login' ?></a></li>
          <li><a href="<?= Url::to(['/site/admin']) ?>"><?= $isRtl ? 'لوحة المشرف العام' : 'Super Admin Panel' ?></a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4><?= $isRtl ? 'المدن المغطاة' : 'Active Coverage' ?></h4>
        <ul>
          <li><a href="#">الرياض (Riyadh)</a></li>
          <li><a href="#">جدة (Jeddah)</a></li>
          <li><a href="#">الدمام والخبر (Dammam & Khobar)</a></li>
          <li><a href="#">مكة المكرمة والمدينة المنورة</a></li>
          <li><a href="#">القصيم وتبوك والأحساء</a></li>
        </ul>
      </div>

    </div>

    <div class="footer-bottom">
      <div>
        &copy; <?= date('Y') ?> PARTO Inc. <?= $isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved' ?>.
      </div>
      <div style="display: flex; gap: 1.5rem;">
        <a href="<?= $homeUrl ?>"><?= $isRtl ? 'الشروط والأحكام' : 'Terms' ?></a>
        <a href="<?= $homeUrl ?>"><?= $isRtl ? 'سياسة الخصوصية' : 'Privacy' ?></a>
        <a href="https://parto.dynapulsar.com"><?= $isRtl ? 'سيرفر هوستنجر' : 'Hostinger Server' ?></a>
      </div>
    </div>
  </footer>

  <!-- Native App Mobile Bottom Navigation Bar -->
  <nav class="mobile-bottom-bar" aria-label="Mobile Navigation Bar">
    <a href="<?= $homeUrl ?>" class="bottom-nav-item <?= $activeController === 'site' && $activeAction === 'index' ? 'active' : '' ?>">
      <span class="bottom-nav-icon">🏠</span>
      <span class="bottom-nav-label"><?= $isRtl ? 'السوق' : 'Market' ?></span>
    </a>
    <a href="<?= Url::to(['/workshop/index']) ?>" class="bottom-nav-item <?= $activeController === 'workshop' ? 'active' : '' ?>">
      <span class="bottom-nav-icon">🔧</span>
      <span class="bottom-nav-label"><?= $isRtl ? 'الورش' : 'Workshops' ?></span>
    </a>
    <a href="<?= Url::to(['/towing/index']) ?>" class="bottom-nav-item <?= $activeController === 'towing' ? 'active' : '' ?>">
      <span class="bottom-nav-icon">🛻</span>
      <span class="bottom-nav-label"><?= $isRtl ? 'سطحة' : 'Towing' ?></span>
    </a>
    <button type="button" class="bottom-nav-item" onclick="Parto.openCartDrawer()">
      <span class="bottom-nav-icon">
        🛒
        <span class="badge-count cart-badge-count" style="display: none;">0</span>
      </span>
      <span class="bottom-nav-label"><?= $isRtl ? 'السلة' : 'Cart' ?></span>
    </button>
    <button type="button" class="bottom-nav-item" onclick="Parto.toggleMobileNav()">
      <span class="bottom-nav-icon">☰</span>
      <span class="bottom-nav-label"><?= $isRtl ? 'القائمة' : 'Menu' ?></span>
    </button>
  </nav>

  <!-- Reusable Sliding Cart Drawer -->
  <div class="cart-overlay" id="cartOverlay" onclick="Parto.closeCartDrawer()"></div>
  <aside class="cart-drawer" id="cartDrawer">
    <div class="cart-header">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.3rem;">🛒</span>
        <h3><?= $isRtl ? 'سلة المشتريات' : 'Shopping Cart' ?></h3>
      </div>
      <button class="btn-icon" onclick="Parto.closeCartDrawer()" style="width: 32px; height: 32px;">✕</button>
    </div>

    <div class="cart-body" id="cartDrawerItems">
      <!-- Populated dynamically by Parto.updateCartUI() -->
    </div>

    <div class="cart-footer">
      <div class="cart-subtotal-row">
        <span><?= $isRtl ? 'المجموع الفرعي:' : 'Subtotal:' ?></span>
        <span id="cartDrawerSubtotal" style="color: #38bdf8;">0.00 <?= $isRtl ? 'ر.س' : 'SAR' ?></span>
      </div>
      
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;">
        <span>🚚</span>
        <span><?= $isRtl ? 'الشحن عبر سمسا / البريد السعودي (سُبل) / أرامكس' : 'Domestic delivery via SMSA / Saudi Post / Aramex' ?></span>
      </div>

      <a href="<?= Url::to(['/checkout/index']) ?>" id="cartDrawerCheckoutBtn" class="btn-primary" style="width: 100%; text-decoration: none;">
        <span><?= $isRtl ? 'متابعة الدفع والشحن' : 'Proceed to Checkout' ?></span>
        <span><?= $isRtl ? '←' : '→' ?></span>
      </a>
    </div>
  </aside>

  <!-- Floating AI Assistant Widget -->
  <?php if (file_exists(Yii::getAlias('@app/includes/ai-widget.php'))): ?>
    <?php include Yii::getAlias('@app/includes/ai-widget.php'); ?>
  <?php endif; ?>

  <!-- Scripts -->
  <script src="<?= Url::to('@web/assets/js/main.js') ?>"></script>
  <script src="<?= Url::to('@web/assets/js/chat.js') ?>"></script>
  <script>
    // Live notification bell checker
    async function fetchNotifications() {
      try {
        const res = await fetch('<?= Url::to(['/api/orders']) ?>');
        const data = await res.json();
        const badge = document.getElementById('notifBadgeCount');
        if (badge && data.success && data.orders) {
          badge.textContent = data.orders.length;
          badge.style.display = data.orders.length > 0 ? 'flex' : 'none';
        }
      } catch (e) {}
    }
    function toggleNotifications() {
      Parto.showToast('<?= $isRtl ? "نظام الإشعارات الفوري متصل ومحدث (Yii 2)" : "Realtime notification system connected (Yii 2)" ?>');
    }
    document.addEventListener('DOMContentLoaded', fetchNotifications);
  </script>

<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
