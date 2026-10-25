<?php
global $isRtl;
?>
<!-- Cart Drawer & Overlay -->
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

    <a href="checkout.php" id="cartDrawerCheckoutBtn" class="btn-primary" style="width: 100%; text-decoration: none;">
      <span><?= $isRtl ? 'متابعة الدفع والشحن' : 'Proceed to Checkout' ?></span>
      <span><?= $isRtl ? '←' : '→' ?></span>
    </a>
  </div>
</aside>
