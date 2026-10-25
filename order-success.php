<?php
$pageTitle = 'تم استلام طلبك بنجاح | بارتو السعودية';
$activeNav = 'checkout';
require_once __DIR__ . '/config/db.php';
global $isRtl;

$orderNumber = $_GET['order'] ?? '';
$order = null;

if (!empty($orderNumber)) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = :ord LIMIT 1");
    $stmt->execute([':ord' => $orderNumber]);
    $order = $stmt->fetch();
    if ($order) {
        $order['items'] = json_decode($order['items_json'], true) ?: [];
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 680px; margin: 3rem auto 5rem; padding: 0 1.5rem;">
  
  <div class="search-card" style="padding: 3rem 2rem; text-align: center;">
    
    <div style="width: 72px; height: 72px; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.5rem; color: #10b981;">
      ✓
    </div>

    <h1 style="font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem;">
      <?= $isRtl ? 'تم تأكيد طلبك بنجاح! 🎉' : 'Order Placed Successfully! 🎉' ?>
    </h1>

    <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 2rem;">
      <?= $isRtl 
        ? 'شكراً لتسوقك من منصة بارتو. تم إرسال تفاصيل الفاتورة وبوليصة الشحن، وجاري تجهيز قطع الغيار للشحن فوراً.' 
        : 'Thank you for choosing PARTO. Your order has been dispatched to the vendor for fulfillment.' ?>
    </p>

    <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.5rem; text-align: right; margin-bottom: 2rem;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-dark);">
        <span style="color: var(--text-muted); font-size: 0.9rem;"><?= $isRtl ? 'رقم تتبع الطلب:' : 'Order Tracking ID:' ?></span>
        <span style="font-weight: 900; color: #38bdf8; font-size: 1.15rem; font-family: monospace;"><?= e($orderNumber ?: 'PRT-882941') ?></span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="color: var(--text-muted); font-size: 0.9rem;"><?= $isRtl ? 'شركة الشحن والتوصيل:' : 'Courier Carrier:' ?></span>
        <span style="font-weight: 700; color: #fff;"><?= e($order['shipping_provider'] ?? 'SMSA Express') ?></span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="color: var(--text-muted); font-size: 0.9rem;"><?= $isRtl ? 'المستلم:' : 'Customer:' ?></span>
        <span style="font-weight: 700; color: #fff;"><?= e($order['customer_name'] ?? 'فهد المطيري') ?> (<?= e($order['customer_phone'] ?? '05xxxxxxx') ?>)</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="color: var(--text-muted); font-size: 0.9rem;"><?= $isRtl ? 'عنوان التوصيل:' : 'Delivery Address:' ?></span>
        <span style="font-weight: 700; color: #fff;"><?= e($order['delivery_city'] ?? 'الرياض') ?> - <?= e($order['delivery_address'] ?? 'حي الياسمين') ?></span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border-dark);">
        <span style="color: var(--text-muted); font-size: 0.9rem;"><?= $isRtl ? 'المبلغ الإجمالي المدفوع:' : 'Total Paid:' ?></span>
        <span style="font-weight: 900; color: #34d399; font-size: 1.25rem;">
          <?= number_format((float)($order['total_amount'] ?? 410.00), 2) ?> <?= $isRtl ? 'ر.س' : 'SAR' ?>
        </span>
      </div>

    </div>

    <div style="display: flex; gap: 1rem; justify-content: center;">
      <a href="index.php" class="btn-primary" style="padding: 0.85rem 1.75rem;">
        <span><?= $isRtl ? 'العودة للتسوق' : 'Continue Shopping' ?></span>
      </a>
      <button class="btn-primary" style="background: rgba(255,255,255,0.08); border: 1px solid var(--border-dark);" onclick="window.print()">
        <span>🖨️ <?= $isRtl ? 'طباعة الفاتورة' : 'Print Invoice' ?></span>
      </button>
    </div>

  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
