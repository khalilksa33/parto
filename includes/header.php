<?php
require_once dirname(__DIR__) . '/config/config.php';
global $currentLang, $isRtl;

$navTitles = [
    'home'          => ['ar' => 'بارتو السعودية | سوق قطع غيار السيارات والخدمات المتكاملة', 'en' => 'PARTO Saudi Arabia | Auto Spare Parts & Automotive Hub'],
    'product'       => ['ar' => 'تفاصيل قطعة الغيار الأصلية | بارتو السعودية', 'en' => 'Genuine Auto Part Details | PARTO Saudi Arabia'],
    'checkout'      => ['ar' => 'إتمام الطلب والدفع الآمن | بارتو السعودية', 'en' => 'Secure Checkout & Delivery | PARTO Saudi Arabia'],
    'order-success' => ['ar' => 'تم استلام وتأكيد طلبك بنجاح | بارتو السعودية', 'en' => 'Order Confirmed Successfully | PARTO Saudi Arabia'],
    'portal'        => ['ar' => 'لوحة تحكم البائع والتاجر | بارتو السعودية', 'en' => 'Vendor Management Portal | PARTO Saudi Arabia'],
    'admin'         => ['ar' => 'لوحة تحكم المشرف العام | بارتو السعودية', 'en' => 'Super Admin Center | PARTO Saudi Arabia'],
    'register'      => ['ar' => 'تسجيل الشركاء والبائعين والموزعين | بارتو السعودية', 'en' => 'Vendor & Distributor Registration | PARTO Saudi Arabia'],
    'workshop'      => ['ar' => 'ورش صيانة السيارات والورش المتنقلة | بارتو السعودية', 'en' => 'Auto Repair Workshops & Mobile Mechanics | PARTO Saudi Arabia'],
    'towing'        => ['ar' => 'سطحات وسحب مركبات فوري 24/7 | بارتو السعودية', 'en' => 'Emergency Towing & Satha Dispatch 24/7 | PARTO Saudi Arabia'],
    'oem'           => ['ar' => 'كتالوج قطع غيار الوكالة والأرقام الأصلية | بارتو السعودية', 'en' => 'OEM Fitment Catalog & Genuine Part Numbers | PARTO Saudi Arabia'],
    'tashleeh'      => ['ar' => 'تشليح سيارات وسكراب | بارتو السعودية', 'en' => 'Tashleeh Salvage & Used Parts | PARTO Saudi Arabia'],
];

$activeNav = $activeNav ?? 'home';

// Resolve page title dynamically based on active language
if (isset($pageTitleAr) && isset($pageTitleEn)) {
    $pageTitle = $isRtl ? $pageTitleAr : $pageTitleEn;
} elseif (isset($pageTitle) && is_array($pageTitle)) {
    $pageTitle = $isRtl ? ($pageTitle['ar'] ?? '') : ($pageTitle['en'] ?? '');
} elseif (!$isRtl && isset($pageTitle) && preg_match('/[\x{0600}-\x{06FF}]/u', $pageTitle)) {
    // If English mode is active but page set an Arabic title string, resolve English equivalent
    $pageTitle = $navTitles[$activeNav]['en'] ?? (APP_NAME . ' Saudi Arabia - ' . APP_TAGLINE);
} elseif (empty($pageTitle)) {
    $pageTitle = $navTitles[$activeNav][$isRtl ? 'ar' : 'en'] ?? (APP_NAME . ' - ' . ($isRtl ? APP_TAGLINE_AR : APP_TAGLINE));
}
?>
<!DOCTYPE html>
<html lang="<?= e($currentLang) ?>" dir="<?= $isRtl ? 'rtl' : 'ltr' ?>" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title><?= e($pageTitle) ?></title>
  <meta name="description" content="<?= $isRtl ? 'منصة بارتو السعودية لقطع غيار السيارات الأصلية والورش المعتمدة وسطحات السحب الفورية.' : 'PARTO - Saudi Arabia Premier Automotive Marketplace for genuine OEM auto parts, certified workshops, and emergency towing dispatch.' ?>">
  <link rel="icon" type="image/png" href="assets/images/logo.png">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

  <!-- Navigation Bar -->
  <header class="navbar">
    <div class="nav-container">
      
      <!-- Mobile Menu Hamburger Button -->
      <button class="mobile-menu-btn" id="mobileMenuToggle" aria-label="Toggle navigation menu" onclick="Parto.toggleMobileNav()">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Brand Logo -->
      <a href="index.php" class="brand-logo" title="<?= APP_NAME ?>">
        <img src="assets/images/logo.png" alt="PARTO Logo" onerror="this.src='assets/images/logo.jpg'">
        <span class="brand-badge"><?= $isRtl ? 'السعودية' : 'KSA' ?></span>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="desktop-nav">
        <ul class="nav-links">
          <li class="nav-item <?= $activeNav === 'home' ? 'active' : '' ?>">
            <a href="index.php">
              <span>🏠</span>
              <span><?= $isRtl ? 'السوق الرئيسي' : 'Marketplace' ?></span>
            </a>
          </li>
          <!-- Tashleeh (Used Parts) - Temporarily disabled for launch
          <li class="nav-item <?= $activeNav === 'tashleeh' ? 'active' : '' ?>">
            <a href="tashleeh.php">
              <span>🚗</span>
              <span><?= $isRtl ? 'التشليح (مستعمل)' : 'Tashleeh (Used)' ?></span>
            </a>
          </li>
          -->
          <li class="nav-item <?= $activeNav === 'workshop' ? 'active' : '' ?>">
            <a href="workshop.php">
              <span>🔧</span>
              <span><?= $isRtl ? 'ورش الصيانة' : 'Workshops' ?></span>
            </a>
          </li>
          <li class="nav-item <?= $activeNav === 'towing' ? 'active' : '' ?>">
            <a href="towing.php">
              <span>🛻</span>
              <span><?= $isRtl ? 'سطحات وسحب' : 'Towing & Satha' ?></span>
            </a>
          </li>
          <li class="nav-item <?= $activeNav === 'oem' ? 'active' : '' ?>">
            <a href="oem.php">
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
          <a href="?lang=ar" class="lang-btn <?= $isRtl ? 'active' : '' ?>">عربي</a>
          <a href="?lang=en" class="lang-btn <?= !$isRtl ? 'active' : '' ?>">EN</a>
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
        <a href="portal.php" class="btn-vendor-portal" title="<?= $isRtl ? 'لوحة تحكم البائع والتاجر' : 'Vendor Management Portal' ?>">
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
      <div class="brand-logo" title="<?= APP_NAME ?>">
        <img src="assets/images/logo.png" alt="PARTO Logo" onerror="this.src='assets/images/logo.jpg'">
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
          <a href="?lang=ar" class="lang-btn <?= $isRtl ? 'active' : '' ?>">عربي</a>
          <a href="?lang=en" class="lang-btn <?= !$isRtl ? 'active' : '' ?>">EN</a>
        </div>
      </div>

      <nav class="mobile-nav-menu">
        <div class="drawer-section-title"><?= $isRtl ? 'أقسام المنصة الرئيسية' : 'Marketplace Sections' ?></div>
        <a href="index.php" class="mobile-nav-link <?= $activeNav === 'home' ? 'active' : '' ?>">
          <span class="drawer-icon">🏠</span>
          <span class="drawer-title"><?= $isRtl ? 'السوق الرئيسي وقطع الغيار' : 'Spare Parts Marketplace' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <!-- Tashleeh (Used Parts) - Temporarily disabled for launch
        <a href="tashleeh.php" class="mobile-nav-link <?= $activeNav === 'tashleeh' ? 'active' : '' ?>">
          <span class="drawer-icon">🚗</span>
          <span class="drawer-title"><?= $isRtl ? 'مركز التشليح والسكراب (RFQ)' : 'Tashleeh & Used Parts (RFQ)' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        -->
        <a href="towing.php" class="mobile-nav-link <?= $activeNav === 'towing' ? 'active' : '' ?>">
          <span class="drawer-icon">🛻</span>
          <span class="drawer-title"><?= $isRtl ? 'سطحات وسحب فوري 24/7' : 'Emergency Towing & Satha' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="workshop.php" class="mobile-nav-link <?= $activeNav === 'workshop' ? 'active' : '' ?>">
          <span class="drawer-icon">🔧</span>
          <span class="drawer-title"><?= $isRtl ? 'ورش الصيانة والميكانيكي المتنقل' : 'Workshops & Mobile Mechanic' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="oem.php" class="mobile-nav-link <?= $activeNav === 'oem' ? 'active' : '' ?>">
          <span class="drawer-icon">📐</span>
          <span class="drawer-title"><?= $isRtl ? 'كتالوج الوكالة ومطابقة OEM' : 'OEM Fitment Catalog' ?></span>
          <span class="drawer-arrow">›</span>
        </a>

        <div class="drawer-section-title"><?= $isRtl ? 'التجار والشركاء' : 'Vendors & Operations' ?></div>
        <a href="portal.php" class="mobile-nav-link <?= $activeNav === 'portal' ? 'active' : '' ?>">
          <span class="drawer-icon">🏪</span>
          <span class="drawer-title"><?= $isRtl ? 'لوحة تحكم التاجر والبائع' : 'Vendor Control Hub' ?></span>
          <span class="drawer-badge"><?= $isRtl ? 'دخول' : 'Access' ?></span>
        </a>
        <a href="admin.php" class="mobile-nav-link <?= $activeNav === 'admin' ? 'active' : '' ?>">
          <span class="drawer-icon">🛡️</span>
          <span class="drawer-title"><?= $isRtl ? 'لوحة المشرف العام' : 'Super Admin Center' ?></span>
          <span class="drawer-arrow">›</span>
        </a>
        <a href="register.php" class="mobile-nav-link">
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
