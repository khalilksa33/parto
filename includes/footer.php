<?php
global $isRtl;
?>
  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      
      <div class="footer-brand">
        <a href="index.php" class="brand-logo" title="<?= APP_NAME ?>">
          <img src="assets/images/logo.png" alt="PARTO Logo" onerror="this.src='assets/images/logo.jpg'">
        </a>
        <p>
          <?= $isRtl 
            ? 'المنصة السعودية الشاملة لقطع غيار السيارات الجديدة الأصلية وخدمات السطحات والورش المعتمدة بجميع مدن المملكة العربية السعودية.' 
            : 'Saudi Arabia\'s unified digital marketplace for genuine new auto parts, 24/7 towing dispatch, and certified workshops.' ?>
        </p>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);">🇸🇦 المملكة العربية السعودية</span>
          <span style="font-size: 0.75rem; background: rgba(37,99,235,0.15); color: #60a5fa; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);">v<?= APP_VERSION ?></span>
        </div>
      </div>

      <div class="footer-col">
        <h4><?= $isRtl ? 'الخدمات والأقسام' : 'Marketplace Services' ?></h4>
        <ul>
          <li><a href="index.php"><?= $isRtl ? 'قطع غيار جديدة وموزعين' : 'New Auto Spare Parts' ?></a></li>
          <!-- Tashleeh - Temporarily disabled for launch
          <li><a href="tashleeh.php"><?= $isRtl ? 'تشليح وسكراب سيارات' : 'Tashleeh Scrap Yards' ?></a></li>
          -->
          <li><a href="workshop.php"><?= $isRtl ? 'ورش الصيانة وميكانيكا' : 'Auto Workshops' ?></a></li>
          <li><a href="towing.php"><?= $isRtl ? 'سطحات وسحب مركبات' : 'Towing & Flatbed (Satha)' ?></a></li>
          <li><a href="oem.php"><?= $isRtl ? 'كتالوج وكالات وتوافقية' : 'OEM Fitment Catalog' ?></a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4><?= $isRtl ? 'الشركاء والبائعين' : 'Vendors & Partners' ?></h4>
        <ul>
          <li><a href="register.php"><?= $isRtl ? 'سجّل كبائع أو موزع' : 'Register Vendor Account' ?></a></li>
          <li><a href="portal.php"><?= $isRtl ? 'لوحة تحكم التاجر' : 'Vendor Portal Login' ?></a></li>
          <li><a href="admin.php"><?= $isRtl ? 'لوحة المشرف العام' : 'Super Admin Panel' ?></a></li>
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
        &copy; <?= date('Y') ?> <?= APP_NAME ?> Inc. <?= $isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved' ?>.
      </div>
      <div style="display: flex; gap: 1.5rem;">
        <a href="index.php"><?= $isRtl ? 'الشروط والأحكام' : 'Terms' ?></a>
        <a href="index.php"><?= $isRtl ? 'سياسة الخصوصية' : 'Privacy' ?></a>
        <a href="https://parto.dynapulsar.com"><?= $isRtl ? 'سيرفر هوستنجر' : 'Hostinger Server' ?></a>
      </div>
    </div>
  </footer>

  <!-- Native App Mobile Bottom Navigation Bar -->
  <nav class="mobile-bottom-bar" aria-label="Mobile Navigation Bar">
    <a href="index.php" class="bottom-nav-item <?= $activeNav === 'home' ? 'active' : '' ?>">
      <span class="bottom-nav-icon">🏠</span>
      <span class="bottom-nav-label"><?= $isRtl ? 'السوق' : 'Market' ?></span>
    </a>
    <a href="workshop.php" class="bottom-nav-item <?= $activeNav === 'workshop' ? 'active' : '' ?>">
      <span class="bottom-nav-icon">🔧</span>
      <span class="bottom-nav-label"><?= $isRtl ? 'الورش' : 'Workshops' ?></span>
    </a>
    <a href="towing.php" class="bottom-nav-item <?= $activeNav === 'towing' ? 'active' : '' ?>">
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
  <?php require_once __DIR__ . '/cart-drawer.php'; ?>

  <!-- Floating AI Assistant Widget -->
  <?php require_once __DIR__ . '/ai-widget.php'; ?>

  <!-- Scripts -->
  <script src="assets/js/main.js"></script>
  <script src="assets/js/chat.js"></script>
  <script>
    // Live notification bell checker
    async function fetchNotifications() {
      try {
        const res = await fetch('api/notifications.php');
        const data = await res.json();
        const badge = document.getElementById('notifBadgeCount');
        if (badge && data.success) {
          badge.textContent = data.unread_count;
          badge.style.display = data.unread_count > 0 ? 'flex' : 'none';
        }
      } catch (e) {}
    }
    function toggleNotifications() {
      Parto.showToast('<?= $isRtl ? "نظام الإشعارات الفوري متصل ومحدث" : "Realtime notification system connected" ?>');
    }
    document.addEventListener('DOMContentLoaded', fetchNotifications);
  </script>
</body>
</html>
