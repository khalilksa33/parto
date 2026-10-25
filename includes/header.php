<?php
require_once dirname(__DIR__) . '/config/config.php';
global $currentLang, $isRtl;

$pageTitle = $pageTitle ?? (APP_NAME . ' - ' . ($isRtl ? APP_TAGLINE_AR : APP_TAGLINE));
$activeNav = $activeNav ?? 'home';
?>
<!DOCTYPE html>
<html lang="<?= e($currentLang) ?>" dir="<?= $isRtl ? 'rtl' : 'ltr' ?>" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title><?= e($pageTitle) ?></title>
  <meta name="description" content="<?= $isRtl ? 'منصة بارتو السعودية لقطع غيار السيارات الأصلية والتشليح والخدمات الميكانيكية وسطحات السحب الفورية.' : 'PARTO - Saudi Arabia Premier Automotive Marketplace for genuine OEM auto parts, Tashleeh scrap yards, and emergency towing services.' ?>">
  <link rel="icon" type="image/png" href="assets/images/logo.png">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

  <!-- Navigation Bar -->
  <header class="navbar">
    <div class="nav-container">
      
      <!-- Brand Logo -->
      <a href="index.php" class="brand-logo">
        <img src="assets/images/logo.png" alt="PARTO Logo" onerror="this.src='assets/images/logo.jpg'">
        <span><?= APP_NAME ?></span>
        <span class="brand-badge"><?= $isRtl ? 'السعودية' : 'KSA' ?></span>
      </a>

      <!-- Desktop Navigation Links -->
      <nav>
        <ul class="nav-links">
          <li class="nav-item <?= $activeNav === 'home' ? 'active' : '' ?>">
            <a href="index.php">
              <span>🏠</span>
              <span><?= $isRtl ? 'السوق الرئيسي' : 'Marketplace' ?></span>
            </a>
          </li>
          <li class="nav-item <?= $activeNav === 'tashleeh' ? 'active' : '' ?>">
            <a href="tashleeh.php">
              <span>🚗</span>
              <span><?= $isRtl ? 'التشليح (مستعمل)' : 'Tashleeh (Used)' ?></span>
            </a>
          </li>
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
        <a href="portal.php" class="btn-vendor-portal">
          <span>🏪</span>
          <span><?= $isRtl ? 'لوحة البائع' : 'Vendor Hub' ?></span>
        </a>

      </div>

    </div>
  </header>
