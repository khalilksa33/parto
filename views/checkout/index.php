<?php

/** @var yii\web\View $this */
/** @var bool $isRtl */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'إتمام الطلب والدفع الآمن | بارتو السعودية' 
    : 'Secure Checkout & Delivery | PARTO Saudi Arabia';
?>

<div style="max-width: 1050px; margin: 2rem auto 4rem; padding: 0 1.5rem;">

  <div style="text-align: center; margin-bottom: 2.5rem;">
    <h1 style="font-size: 2.3rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem;">
      <?= $isRtl ? 'إتمام الشراء والدفع الآمن' : 'Secure Checkout & Delivery' ?>
    </h1>
    <p style="color: var(--text-secondary); font-size: 1rem;">
      <?= $isRtl 
        ? 'أدخل بيانات التوصيل، واختر شركة الشحن وطريقة الدفع المعتمدة.' 
        : 'Enter your shipping address and select your preferred KSA courier and payment method.' ?>
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem;" id="checkoutLayout">
    
    <!-- Left Column: Customer Details, Shipping Carrier & Payment -->
    <div>
      
      <!-- 1. Customer & Delivery Address -->
      <div class="search-card" style="padding: 1.75rem; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>📍</span>
          <span><?= $isRtl ? '1. بيانات المستلم وعنوان التوصيل' : '1. Delivery Details' ?></span>
        </h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'اسم المستلم الثلاثي' : 'Full Name' ?> *</label>
            <input type="text" id="chkName" class="form-control" required placeholder="<?= $isRtl ? 'مثال: عبدالله محمد الدوسري' : 'e.g. Abdullah Mohammed' ?>">
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'رقم الجوال للتوصيل' : 'Mobile Number' ?> *</label>
            <input type="tel" id="chkPhone" class="form-control" required placeholder="05xxxxxxxx">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'البريد الإلكتروني' : 'Email Address' ?></label>
            <input type="email" id="chkEmail" class="form-control" placeholder="name@domain.com">
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'المدينة' : 'City' ?> *</label>
            <select id="chkCity" class="form-control" onchange="calculateShipping()">
              <option value="Riyadh">الرياض (Riyadh)</option>
              <option value="Jeddah">جدة (Jeddah)</option>
              <option value="Dammam">الدمام (Dammam)</option>
              <option value="Khobar">الخبر (Khobar)</option>
              <option value="Mecca">مكة المكرمة (Makkah)</option>
              <option value="Medina">المدينة المنورة (Madinah)</option>
              <option value="Qassim">القصيم (Buraidah/Unaizah)</option>
              <option value="Tabuk">تبوك (Tabuk)</option>
              <option value="Abha">أبها وخميس مشيط (Asir)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'العنوان الوطني أو اسم الحي والشارع' : 'Street Address / National Address' ?> *</label>
          <input type="text" id="chkAddress" class="form-control" required placeholder="<?= $isRtl ? 'مثال: حي الياسمين، شارع أنس بن مالك، مبنى رقم 452' : 'District, Street Name, House Number' ?>">
        </div>
      </div>

      <!-- 2. Shipping Carrier -->
      <div class="search-card" style="padding: 1.75rem; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🚚</span>
          <span><?= $isRtl ? '2. اختيار شركة الشحن الداخلي' : '2. Select Delivery Carrier' ?></span>
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-md); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="radio" name="shippingCarrier" value="SMSA Express" checked data-fee="25" onchange="calculateShipping()">
              <div>
                <div style="font-weight: 800; color: #fff;">سمسا إكسبريس (SMSA Express)</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">توصيل سريع لباب المنزل (خلال 1–2 يوم عمل)</div>
              </div>
            </div>
            <span style="font-weight: 800; color: #38bdf8;">25.00 ر.س</span>
          </label>

          <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-md); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="radio" name="shippingCarrier" value="SPL Saudi Post" data-fee="18" onchange="calculateShipping()">
              <div>
                <div style="font-weight: 800; color: #fff;">البريد السعودي - سُبل (SPL)</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">التوصيل الاقتصادي لجميع فروع المملكة (2–3 أيام)</div>
              </div>
            </div>
            <span style="font-weight: 800; color: #38bdf8;">18.00 ر.س</span>
          </label>

          <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-md); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="radio" name="shippingCarrier" value="Aramex" data-fee="28" onchange="calculateShipping()">
              <div>
                <div style="font-weight: 800; color: #fff;">أرامكس (Aramex Domestic)</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">شحن موثوق وتتبع حي فوري (1–2 يوم عمل)</div>
              </div>
            </div>
            <span style="font-weight: 800; color: #38bdf8;">28.00 ر.س</span>
          </label>
        </div>
      </div>

      <!-- 3. Payment Method -->
      <div class="search-card" style="padding: 1.75rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>💳</span>
          <span><?= $isRtl ? '3. وسيلة الدفع' : '3. Payment Method' ?></span>
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;">
          <label style="border: 1px solid var(--border-dark); padding: 0.85rem; border-radius: var(--radius-md); text-align: center; cursor: pointer; background: rgba(255,255,255,0.03);">
            <input type="radio" name="paymentMethod" value="mada" checked>
            <div style="font-size: 1.5rem; margin: 0.25rem 0;">💳</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">بطاقة مدى (Mada)</div>
          </label>

          <label style="border: 1px solid var(--border-dark); padding: 0.85rem; border-radius: var(--radius-md); text-align: center; cursor: pointer; background: rgba(255,255,255,0.03);">
            <input type="radio" name="paymentMethod" value="apple_pay">
            <div style="font-size: 1.5rem; margin: 0.25rem 0;">🍏</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">Apple Pay</div>
          </label>

          <label style="border: 1px solid var(--border-dark); padding: 0.85rem; border-radius: var(--radius-md); text-align: center; cursor: pointer; background: rgba(255,255,255,0.03);">
            <input type="radio" name="paymentMethod" value="credit_card">
            <div style="font-size: 1.5rem; margin: 0.25rem 0;">🏦</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">فيزا / ماستركارد</div>
          </label>

          <label style="border: 1px solid var(--border-dark); padding: 0.85rem; border-radius: var(--radius-md); text-align: center; cursor: pointer; background: rgba(255,255,255,0.03);">
            <input type="radio" name="paymentMethod" value="cod">
            <div style="font-size: 1.5rem; margin: 0.25rem 0;">💵</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: #fff;">الدفع عند الاستلام</div>
          </label>
        </div>
      </div>

    </div>

    <!-- Right Column: Order Summary -->
    <div>
      <div class="search-card" style="padding: 1.75rem; position: sticky; top: 90px;">
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem;">
          🛒 <?= $isRtl ? 'ملخص الطلب والقطع' : 'Order Summary' ?>
        </h3>

        <div id="checkoutItemsList" style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-dark);">
          <!-- Injected via JS -->
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.92rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span><?= $isRtl ? 'المجموع الفرعي للقطع:' : 'Items Subtotal:' ?></span>
            <span id="chkSubtotal" style="color: #fff; font-weight: 700;">0.00 ر.س</span>
          </div>

          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span><?= $isRtl ? 'رسوم الشحن والتوصيل:' : 'Shipping Fee:' ?></span>
            <span id="chkShippingFee" style="color: #fff; font-weight: 700;">25.00 ر.س</span>
          </div>

          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span><?= $isRtl ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15% Included):' ?></span>
            <span style="color: #34d399; font-weight: 700;"><?= $isRtl ? 'مشمولة' : 'Included' ?></span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900; color: #38bdf8; padding-top: 0.75rem; border-top: 1px solid var(--border-dark);">
            <span><?= $isRtl ? 'الإجمالي الكلي:' : 'Total Amount:' ?></span>
            <span id="chkGrandTotal">0.00 ر.س</span>
          </div>
        </div>

        <button id="placeOrderBtn" class="btn-primary" style="width: 100%; padding: 1.1rem; font-size: 1.05rem;" onclick="submitOrder()">
          <span><?= $isRtl ? 'تأكيد ودفع الطلب الآن' : 'Place & Pay Order Now' ?></span>
          <span>🔒</span>
        </button>

        <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem;">
          🛡️ <?= $isRtl ? 'دفع إلكتروني آمن 100% متوافق مع نظام التجارة الإلكترونية السعودي' : '100% Encrypted & Compliant with Saudi E-Commerce Standards' ?>
        </div>
      </div>
    </div>

  </div>

</div>

<script>
let currentShippingFee = 25.00;

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutItems();
  calculateShipping();
});

function renderCheckoutItems() {
  const cart = Parto.getCart();
  const list = document.getElementById('checkoutItemsList');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding: 2rem 0; color: var(--text-muted);"><?= $isRtl ? 'سلتك فارغة.' : 'Your cart is empty.' ?> <a href="<?= Url::to(['/site/index']) ?>" style="color: var(--primary);"><?= $isRtl ? 'تصفح المتجر' : 'Browse Store' ?></a></div>`;
    document.getElementById('placeOrderBtn').disabled = true;
    return;
  }

  list.innerHTML = cart.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <img src="${item.image}" alt="${item.name}" style="width: 44px; height: 44px; object-fit: contain; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); padding: 2px;">
        <div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #fff; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${item.quantity} × ${item.price.toFixed(2)} ر.س</div>
        </div>
      </div>
      <div style="font-weight: 800; font-size: 0.92rem; color: #38bdf8;">
        ${(item.price * item.quantity).toFixed(2)} ر.س
      </div>
    </div>
  `).join('');
}

function calculateShipping() {
  const selectedCarrier = document.querySelector('input[name="shippingCarrier"]:checked');
  currentShippingFee = selectedCarrier ? parseFloat(selectedCarrier.dataset.fee) : 25.00;
  
  const subtotal = Parto.getSubtotal();
  const grandTotal = subtotal + currentShippingFee;

  document.getElementById('chkSubtotal').textContent = `${subtotal.toFixed(2)} ر.س`;
  document.getElementById('chkShippingFee').textContent = `${currentShippingFee.toFixed(2)} ر.س`;
  document.getElementById('chkGrandTotal').textContent = `${grandTotal.toFixed(2)} ر.س`;
}

async function submitOrder() {
  const name = document.getElementById('chkName').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();
  const email = document.getElementById('chkEmail').value.trim();
  const city = document.getElementById('chkCity').value;
  const address = document.getElementById('chkAddress').value.trim();
  const cart = Parto.getCart();

  if (!name || !phone || !address) {
    Parto.showToast('<?= $isRtl ? "يرجى إكمال بيانات المستلم والعنوان كاملاً" : "Please complete delivery name, phone, and address" ?>', 'error');
    return;
  }

  if (cart.length === 0) {
    Parto.showToast('<?= $isRtl ? "سلة المشتريات فارغة!" : "Cart is empty!" ?>', 'error');
    return;
  }

  const carrier = document.querySelector('input[name="shippingCarrier"]:checked')?.value || 'SMSA Express';
  const payment = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'mada';

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.innerHTML = '<span><?= $isRtl ? "جاري معالجة الدفع وإنشاء الشحنة (Yii 2)..." : "Processing order & shipment..." ?></span>';

  const payload = {
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    delivery_city: city,
    delivery_address: address,
    shipping_provider: carrier,
    shipping_fee: currentShippingFee,
    payment_method: payment,
    items: cart
  };

  try {
    const res = await fetch('<?= Url::to(['/checkout/submit']) ?>', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await res.json();

    if (!res.ok || !d.success) throw new Error(d.error || 'Failed to process order');

    Parto.clearCart();
    const orderNum = d.order_number || (d.order && d.order.order_number);
    window.location.href = '<?= Url::to(['/checkout/success']) ?>?order=' + encodeURIComponent(orderNum);
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.innerHTML = '<span><?= $isRtl ? "تأكيد ودفع الطلب الآن" : "Place & Pay Order Now" ?></span><span>🔒</span>';
  }
}
</script>
