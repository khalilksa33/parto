/**
 * PARTO - Main JavaScript Engine
 * Handles Cart, VIN Decoding, Brand Filters, Notifications & Drawer
 */

const Parto = (function() {
  'use strict';

  // Cart State (Persisted in localStorage)
  let cart = JSON.parse(localStorage.getItem('parto_cart') || '[]');

  function saveCart() {
    localStorage.setItem('parto_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image || 'assets/images/parts/engine.svg',
        brand: product.brand_name || 'OEM',
        tenantId: product.tenant_id,
        quantity: 1
      });
    }
    saveCart();
    openCartDrawer();
    showToast(document.documentElement.dir === 'rtl' ? 'تمت إضافة القطعة إلى السلة' : 'Item added to cart');
  }

  function updateQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = getCartSubtotal();
    const isRtl = document.documentElement.dir === 'rtl';

    // Update Navbar badge
    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = totalItems;
      el.style.display = totalItems > 0 ? 'flex' : 'none';
    });

    // Update Drawer Body
    const drawerBody = document.getElementById('cartDrawerItems');
    const drawerSubtotal = document.getElementById('cartDrawerSubtotal');
    const drawerCheckoutBtn = document.getElementById('cartDrawerCheckoutBtn');

    if (drawerSubtotal) {
      drawerSubtotal.textContent = isRtl 
        ? `${subtotal.toFixed(2)} ر.س` 
        : `SAR ${subtotal.toFixed(2)}`;
    }

    if (drawerCheckoutBtn) {
      drawerCheckoutBtn.disabled = totalItems === 0;
      drawerCheckoutBtn.style.opacity = totalItems === 0 ? '0.5' : '1';
    }

    if (!drawerBody) return;

    if (cart.length === 0) {
      drawerBody.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
          <p style="font-weight: 700; font-size: 1.1rem; color: #fff;">
            ${isRtl ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
          </p>
          <p style="font-size: 0.88rem; margin-top: 0.5rem;">
            ${isRtl ? 'تصفح قطع الغيار واطلب مباشرة بأفضل الأسعار' : 'Browse auto spare parts and add items to checkout.'}
          </p>
        </div>
      `;
      return;
    }

    drawerBody.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${isRtl ? `${(item.price * item.quantity).toFixed(2)} ر.س` : `SAR ${(item.price * item.quantity).toFixed(2)}`}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="Parto.updateQuantity('${item.id}', -1)">-</button>
            <span style="font-weight: 800; font-size: 0.9rem; min-width: 20px; text-align: center;">${item.quantity}</span>
            <button class="qty-btn" onclick="Parto.updateQuantity('${item.id}', 1)">+</button>
            <button onclick="Parto.removeFromCart('${item.id}')" style="background: none; border: none; color: var(--danger); font-size: 0.8rem; cursor: pointer; margin-inline-start: auto;">
              ${isRtl ? 'حذف' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
    }
  }

  // Toast System
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(50px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #fff;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-full);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      font-size: 0.9rem;
      font-weight: 700;
      z-index: 999;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
    `;
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(50px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Filter Catalog by Brand or Category
  function filterCatalog() {
    const brand = document.querySelector('.brand-card.active')?.dataset.brand || 'all';
    const category = document.querySelector('.category-pill.active')?.dataset.category || 'all';
    const query = (document.getElementById('partSearchInput')?.value || '').toLowerCase().trim();

    document.querySelectorAll('.product-card').forEach(card => {
      const cardBrand = (card.dataset.brand || '').toLowerCase();
      const cardCat = (card.dataset.category || '').toLowerCase();
      const cardName = (card.querySelector('.product-title')?.textContent || '').toLowerCase();

      const matchBrand = (brand === 'all') || (cardBrand === brand.toLowerCase());
      const matchCat = (category === 'all') || (cardCat === category.toLowerCase());
      const matchQuery = !query || cardName.includes(query) || cardBrand.includes(query);

      if (matchBrand && matchCat && matchQuery) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // VIN Decoder Form
  async function handleVinSearch(e) {
    if (e) e.preventDefault();
    const vinInput = document.getElementById('vinInput');
    const resultBox = document.getElementById('vinResultBox');
    const btn = document.getElementById('vinSubmitBtn');
    if (!vinInput) return;

    const vin = vinInput.value.trim().toUpperCase();
    if (vin.length < 5) {
      showToast(document.documentElement.dir === 'rtl' ? 'يرجى إدخال رقم هيكل صحيح (VIN)' : 'Please enter a valid VIN', 'error');
      return;
    }

    if (btn) btn.disabled = true;
    if (resultBox) {
      resultBox.style.display = 'flex';
      resultBox.innerHTML = `<div>⏳ ${document.documentElement.dir === 'rtl' ? 'جاري فك تشفير رقم الهيكل...' : 'Decoding VIN specifications...'}</div>`;
    }

    try {
      const res = await fetch(`api/vin.php?vin=${encodeURIComponent(vin)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to decode VIN');
      }

      const d = json.data;
      if (resultBox) {
        const isRtl = document.documentElement.dir === 'rtl';
        resultBox.innerHTML = `
          <div>
            <div style="font-weight: 800; font-size: 1.15rem; color: #fff;">
              🚗 ${d.make} ${d.model} (${d.year})
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
              ${d.engineDetails ? `${d.engineDetails.engineModel || ''} • ${d.engineDetails.displacement ? d.engineDetails.displacement + 'L' : ''} • ${d.engineDetails.cylinders ? d.engineDetails.cylinders + ' Cylinders' : ''}` : ''}
            </div>
          </div>
          <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="Parto.filterByBrand('${d.make}')">
            ${isRtl ? 'عرض القطع المتوافقة' : 'Show Matching Parts'}
          </button>
        `;
      }

      // Auto filter by the vehicle's make
      filterByBrand(d.make);
    } catch (err) {
      if (resultBox) {
        resultBox.innerHTML = `<div style="color: var(--danger);">❌ ${err.message}</div>`;
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function filterByBrand(brandName) {
    document.querySelectorAll('.brand-card').forEach(b => {
      if (b.dataset.brand.toLowerCase() === brandName.toLowerCase()) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    filterCatalog();
  }

  // Initialize Event Listeners
  document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();

    // Brand click events
    document.querySelectorAll('.brand-card').forEach(card => {
      card.addEventListener('click', function() {
        if (this.classList.contains('active')) {
          this.classList.remove('active');
        } else {
          document.querySelectorAll('.brand-card').forEach(c => c.classList.remove('active'));
          this.classList.add('active');
        }
        filterCatalog();
      });
    });

    // Category pills click events
    document.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', function() {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        filterCatalog();
      });
    });

    // Search input typing
    const searchInput = document.getElementById('partSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', filterCatalog);
    }

    // Tab switcher (VIN vs Quick Part)
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        const vinBox = document.getElementById('vinSearchBox');
        const partBox = document.getElementById('partQuickSearchBox');
        if (tab === 'vin') {
          if (vinBox) vinBox.style.display = 'block';
          if (partBox) partBox.style.display = 'none';
        } else {
          if (vinBox) vinBox.style.display = 'none';
          if (partBox) partBox.style.display = 'block';
        }
      });
    });
  });

  // Mobile Navigation Drawer
  function openMobileNav() {
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('mobileNavOverlay');
    const toggle = document.getElementById('mobileMenuToggle');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (toggle) toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('mobileNavOverlay');
    const toggle = document.getElementById('mobileMenuToggle');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleMobileNav() {
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer && drawer.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCartDrawer,
    closeCartDrawer,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
    handleVinSearch,
    filterByBrand,
    filterCatalog,
    showToast,
    getCart: () => cart,
    getSubtotal: getCartSubtotal
  };
})();

