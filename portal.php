<?php
$pageTitle = 'لوحة تحكم البائع والتاجر | بارتو السعودية';
$activeNav = 'portal';
require_once __DIR__ . '/config/db.php';
global $isRtl;

// Check if tenant ID is passed via query or session
$tenantId = $_GET['tenantId'] ?? $_GET['tenant_id'] ?? ($_SESSION['parto_tenant_id'] ?? null);

$db = getDB();
$tenant = null;

if ($tenantId) {
    $stmt = $db->prepare("SELECT * FROM tenants WHERE id = :id OR subdomain = :sub LIMIT 1");
    $stmt->execute([':id' => $tenantId, ':sub' => $tenantId]);
    $tenant = $stmt->fetch();
    if ($tenant) {
        $_SESSION['parto_tenant_id'] = $tenant['id'];
        $tenantId = $tenant['id'];
    }
}

// Fetch all tenants for the fast switcher
$allTenants = $db->query("SELECT id, name, subdomain, business_type, logo FROM tenants ORDER BY name ASC")->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 1360px; margin: 2rem auto 5rem; padding: 0 1.5rem;">

  <?php if (!$tenant): ?>
    <!-- Login / Select Tenant Screen -->
    <div class="search-card" style="max-width: 520px; margin: 4rem auto; padding: 2.5rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
      <h2 style="font-size: 1.85rem; font-weight: 900; color: #fff; margin-bottom: 0.5rem;">
        <?= $isRtl ? 'تسجيل دخول لوحة البائع' : 'Vendor Portal Login' ?>
      </h2>
      <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 2rem;">
        <?= $isRtl ? 'أدخل معرّف المتجر السري (Tenant ID) الخاص بك للوصول إلى لوحة التحكم' : 'Enter your Tenant ID to access your dashboard' ?>
      </p>

      <form onsubmit="handleTenantLogin(event)" style="margin-bottom: 2rem;">
        <div class="form-group" style="text-align: right;">
          <label class="form-label"><?= $isRtl ? 'معرّف المتجر (Tenant ID)' : 'Tenant ID Context' ?></label>
          <input type="text" id="loginTenantIdInput" class="form-control" required placeholder="t-riyadh-oem / t-tashleeh-star...">
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; padding: 0.95rem;">
          <span><?= $isRtl ? 'دخول لوحة التحكم' : 'Login to Dashboard' ?></span>
          <span>←</span>
        </button>
      </form>

      <div style="border-top: 1px solid var(--border-dark); padding-top: 1.5rem;">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          <?= $isRtl ? 'أو اختر أحد المتاجر المسجلة للتجربة السريعة:' : 'Or choose a demo registered vendor:' ?>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <?php foreach (array_slice($allTenants, 0, 4) as $t): ?>
            <a href="portal.php?tenantId=<?= urlencode($t['id']) ?>" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-md); font-size: 0.88rem; color: #fff;">
              <span><?= e($t['logo']) ?> <?= e($t['name']) ?></span>
              <span style="color: #60a5fa; font-size: 0.78rem; font-family: monospace;"><?= e($t['subdomain']) ?></span>
            </a>
          <?php endforeach; ?>
        </div>
        <div style="margin-top: 1.5rem;">
          <a href="register.php" style="color: #38bdf8; font-weight: 700; font-size: 0.9rem;">
            <?= $isRtl ? '+ تسجيل بائع أو محل تشليح جديد' : '+ Register New Vendor Account' ?>
          </a>
        </div>
      </div>
    </div>

  <?php else: ?>
    <!-- Active Vendor Dashboard -->

    <!-- Storefront Header Bar -->
    <div style="background: linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(17,24,39,0.9) 100%); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.75rem 2rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 1.25rem;">
        <div style="width: 64px; height: 64px; border-radius: var(--radius-lg); background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; border: 1px solid var(--border-highlight);">
          <?= e($tenant['logo'] ?: '⚙️') ?>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <h1 style="font-size: 1.65rem; font-weight: 900; color: #fff;"><?= e($tenant['name']) ?></h1>
            <span class="status-pill status-accepted"><?= e($tenant['status']) ?></span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; display: flex; gap: 1rem;">
            <span>🌐 <?= e($tenant['subdomain']) ?>.parto.dynapulsar.com</span>
            <span>💼 <?= e($tenant['business_type']) ?></span>
            <span>💰 <?= $isRtl ? 'عمولة المنصة:' : 'Commission:' ?> <?= e($tenant['commission_rate']) ?>%</span>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <!-- Switcher dropdown -->
        <select onchange="window.location.href='portal.php?tenantId=' + this.value" class="form-control" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem;">
          <option value=""><?= $isRtl ? 'تبديل المتجر...' : 'Switch Store...' ?></option>
          <?php foreach ($allTenants as $at): ?>
            <option value="<?= e($at['id']) ?>" <?= $at['id'] === $tenant['id'] ? 'selected' : '' ?>>
              <?= e($at['logo']) ?> <?= e($at['name']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <button class="btn-primary" style="padding: 0.55rem 1.15rem; font-size: 0.88rem;" onclick="openAddPartModal()">
          <span>+ <?= $isRtl ? 'إضافة قطعة جديدة' : 'Add New Part' ?></span>
        </button>
        <a href="portal.php?logout=1" class="btn-primary" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171; padding: 0.55rem 0.95rem; font-size: 0.85rem;">
          <?= $isRtl ? 'خروج' : 'Logout' ?>
        </a>
      </div>
    </div>

    <!-- KPI Metric Cards -->
    <?php
      $prodCount = $db->prepare("SELECT COUNT(*) FROM products WHERE tenant_id = :tid");
      $prodCount->execute([':tid' => $tenant['id']]);
      $totalProducts = $prodCount->fetchColumn();

      $ordCount = $db->prepare("SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM orders WHERE tenant_id = :tid");
      $ordCount->execute([':tid' => $tenant['id']]);
      [$totalOrders, $totalSales] = $ordCount->fetch(PDO::FETCH_NUM);

      $rfqCount = $db->query("SELECT COUNT(*) FROM part_requests WHERE status IN ('pending', 'quoted')")->fetchColumn();
    ?>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.25rem;">
        <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'إجمالي المبيعات' : 'Total Revenue' ?></div>
        <div style="font-size: 1.8rem; font-weight: 900; color: #38bdf8; margin: 0.25rem 0;"><?= number_format((float)$totalSales, 2) ?> <span style="font-size: 0.9rem;">ر.س</span></div>
        <div style="font-size: 0.75rem; color: #34d399;">+12% هذا الشهر</div>
      </div>

      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.25rem;">
        <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'القطع المسجلة بالمخزون' : 'Active Inventory' ?></div>
        <div style="font-size: 1.8rem; font-weight: 900; color: #fff; margin: 0.25rem 0;"><?= $totalProducts ?> <span style="font-size: 0.9rem;">قطعة</span></div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">جاهزة للشحن المباشر</div>
      </div>

      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.25rem;">
        <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'الطلبات المستلمة' : 'Customer Orders' ?></div>
        <div style="font-size: 1.8rem; font-weight: 900; color: #a855f7; margin: 0.25rem 0;"><?= $totalOrders ?> <span style="font-size: 0.9rem;">طلب</span></div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">عبر سمسا وسُبل وأرامكس</div>
      </div>

      <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.25rem;">
        <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'طلبات تسعير التشليح (RFQ)' : 'Pending RFQs' ?></div>
        <div style="font-size: 1.8rem; font-weight: 900; color: #f59e0b; margin: 0.25rem 0;"><?= $rfqCount ?> <span style="font-size: 0.9rem;">طلب تسعير</span></div>
        <div style="font-size: 0.75rem; color: #f59e0b;">بانتظار تقديم عروض الأسعار</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-dark); padding-bottom: 0.5rem;">
      <button class="tab-btn active" onclick="switchPortalTab('inventory', this)">
        <span>📦</span>
        <span><?= $isRtl ? 'إدارة المخزون والقطع' : 'Inventory Management' ?></span>
      </button>
      <button class="tab-btn" onclick="switchPortalTab('orders', this)">
        <span>🛒</span>
        <span><?= $isRtl ? 'الطلبات والمبيعات' : 'Orders & Shipments' ?></span>
      </button>
      <button class="tab-btn" onclick="switchPortalTab('rfq', this)">
        <span>⚡</span>
        <span><?= $isRtl ? 'طلبات تسعير التشليح (RFQ)' : 'Tashleeh RFQ Quoting' ?></span>
      </button>
      <button class="tab-btn" onclick="switchPortalTab('settings', this)">
        <span>⚙️</span>
        <span><?= $isRtl ? 'إعدادات المتجر' : 'Store Settings' ?></span>
      </button>
    </div>

    <!-- Tab 1: Inventory Management -->
    <div id="tabInventory" class="portal-tab-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff;">
          <?= $isRtl ? 'قائمة قطع الغيار المعروضة في متجرك' : 'Your Store Products' ?>
        </h3>
        <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="openAddPartModal()">
          + <?= $isRtl ? 'إضافة قطعة' : 'Add Part' ?>
        </button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th><?= $isRtl ? 'القطعة' : 'Product' ?></th>
              <th><?= $isRtl ? 'الشركة المصنعة' : 'Brand' ?></th>
              <th><?= $isRtl ? 'رقم OEM' : 'OEM Number' ?></th>
              <th><?= $isRtl ? 'القسم' : 'Category' ?></th>
              <th><?= $isRtl ? 'السعر (ر.س)' : 'Price (SAR)' ?></th>
              <th><?= $isRtl ? 'المخزون' : 'Stock' ?></th>
              <th><?= $isRtl ? 'إجراءات' : 'Actions' ?></th>
            </tr>
          </thead>
          <tbody id="portalProductsTbody">
            <?php
              $pStmt = $db->prepare("SELECT * FROM products WHERE tenant_id = :tid ORDER BY created_at DESC");
              $pStmt->execute([':tid' => $tenant['id']]);
              $tenantProducts = $pStmt->fetchAll();
            ?>
            <?php if (empty($tenantProducts)): ?>
              <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  <?= $isRtl ? 'لا توجد قطع مضافة في متجرك بعد. اضغط "إضافة قطعة" للبدء.' : 'No products found. Click "Add Part" to begin.' ?>
                </td>
              </tr>
            <?php else: ?>
              <?php foreach ($tenantProducts as $tp): ?>
                <tr id="row-<?= e($tp['id']) ?>">
                  <td style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="<?= e($tp['image']) ?>" alt="" style="width: 38px; height: 38px; object-fit: contain; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px;">
                    <span style="font-weight: 700; color: #fff;"><?= e($tp['name']) ?></span>
                  </td>
                  <td><?= e($tp['brand_name']) ?></td>
                  <td style="font-family: monospace; color: #38bdf8;"><?= e($tp['oem_part_number'] ?: '—') ?></td>
                  <td><span class="badge badge-category"><?= e($tp['category']) ?></span></td>
                  <td>
                    <span id="price-val-<?= e($tp['id']) ?>" style="font-weight: 800; color: #38bdf8;"><?= number_format((float)$tp['price'], 2) ?></span>
                    <button onclick="editPartPrice('<?= e($tp['id']) ?>', '<?= (float)$tp['price'] ?>')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 0.8rem; margin-inline-start: 4px;">✏️</button>
                  </td>
                  <td><?= (int)$tp['stock_quantity'] ?></td>
                  <td>
                    <button class="btn-primary" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171; padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="deletePart('<?= e($tp['id']) ?>')">
                      <?= $isRtl ? 'حذف' : 'Delete' ?>
                    </button>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Orders -->
    <div id="tabOrders" class="portal-tab-content" style="display: none;">
      <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">
        <?= $isRtl ? 'سجل الطلبات الواردة لمتجرك' : 'Incoming Store Orders' ?>
      </h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th><?= $isRtl ? 'رقم الطلب' : 'Order #' ?></th>
              <th><?= $isRtl ? 'العميل' : 'Customer' ?></th>
              <th><?= $isRtl ? 'المدينة والعنوان' : 'Location' ?></th>
              <th><?= $isRtl ? 'المبلغ الإجمالي' : 'Total Amount' ?></th>
              <th><?= $isRtl ? 'الشاحن' : 'Carrier' ?></th>
              <th><?= $isRtl ? 'الحالة' : 'Status' ?></th>
              <th><?= $isRtl ? 'تحديث الحالة' : 'Update Status' ?></th>
            </tr>
          </thead>
          <tbody>
            <?php
              $oStmt = $db->prepare("SELECT * FROM orders WHERE tenant_id = :tid ORDER BY created_at DESC LIMIT 50");
              $oStmt->execute([':tid' => $tenant['id']]);
              $tenantOrders = $oStmt->fetchAll();
            ?>
            <?php if (empty($tenantOrders)): ?>
              <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  <?= $isRtl ? 'لم يتم استلام أي طلبات بعد. ستظهر طلبات الزبائن هنا فوراً.' : 'No orders yet.' ?>
                </td>
              </tr>
            <?php else: ?>
              <?php foreach ($tenantOrders as $to): ?>
                <tr>
                  <td style="font-family: monospace; font-weight: 800; color: #38bdf8;"><?= e($to['order_number']) ?></td>
                  <td>
                    <div style="font-weight: 700; color: #fff;"><?= e($to['customer_name']) ?></div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);"><?= e($to['customer_phone']) ?></div>
                  </td>
                  <td><?= e($to['delivery_city']) ?> - <?= e($to['delivery_address']) ?></td>
                  <td style="font-weight: 800; color: #34d399;"><?= number_format((float)$to['total_amount'], 2) ?> ر.س</td>
                  <td><?= e($to['shipping_provider']) ?></td>
                  <td><span class="status-pill status-<?= e($to['status']) ?>"><?= e($to['status']) ?></span></td>
                  <td>
                    <select onchange="updateOrderStatus('<?= e($to['id']) ?>', this.value)" class="form-control" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: auto;">
                      <option value="pending" <?= $to['status'] === 'pending' ? 'selected' : '' ?>>معلق (Pending)</option>
                      <option value="processing" <?= $to['status'] === 'processing' ? 'selected' : '' ?>>جاري التجهيز</option>
                      <option value="shipped" <?= $to['status'] === 'shipped' ? 'selected' : '' ?>>تم الشحن (Shipped)</option>
                      <option value="delivered" <?= $to['status'] === 'delivered' ? 'selected' : '' ?>>تم التوصيل (Delivered)</option>
                    </select>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 3: Tashleeh RFQ Quoting -->
    <div id="tabRfq" class="portal-tab-content" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff;">
            ⚡ <?= $isRtl ? 'طلبات التسعير الحية من أصحاب السيارات' : 'Live RFQ Part Requests from Car Owners' ?>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">قدم سعرك المنافس مباشرة لصاحب الطلب لزيادة مبيعاتك.</p>
        </div>
        <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="loadRfqData()">
          🔄 <?= $isRtl ? 'تحديث' : 'Refresh' ?>
        </button>
      </div>

      <div id="rfqRequestsList" style="display: flex; flex-direction: column; gap: 1rem;">
        <!-- Loaded via JS -->
      </div>
    </div>

    <!-- Tab 4: Store Settings -->
    <div id="tabSettings" class="portal-tab-content" style="display: none;">
      <div class="search-card" style="max-width: 650px; padding: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem;">
          ⚙️ <?= $isRtl ? 'بيانات وحساب المنشأة' : 'Store Settings & Profile' ?>
        </h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'اسم المتجر' : 'Store Name' ?></label>
            <input type="text" class="form-control" value="<?= e($tenant['name']) ?>" readonly>
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'معرف الرابط (Subdomain)' : 'Subdomain' ?></label>
            <input type="text" class="form-control" value="<?= e($tenant['subdomain']) ?>" readonly>
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'معرف المستأجر السري (Tenant ID)' : 'Secret Tenant ID' ?></label>
            <input type="text" class="form-control" value="<?= e($tenant['id']) ?>" readonly style="font-family: monospace; color: #38bdf8;">
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'نسبة عمولة المنصة' : 'Commission Rate' ?></label>
            <input type="text" class="form-control" value="<?= e($tenant['commission_rate']) ?>%" readonly>
          </div>
        </div>
      </div>
    </div>

  <?php endif; ?>

</div>

<!-- Modal: Add New Part -->
<div class="modal-overlay" id="addPartModal">
  <div class="modal-content">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff;">
        📦 <?= $isRtl ? 'إضافة قطعة غيار جديدة للمخزون' : 'Add New Auto Part to Inventory' ?>
      </h3>
      <button class="btn-icon" style="width: 32px; height: 32px;" onclick="closeAddPartModal()">✕</button>
    </div>

    <form onsubmit="submitNewPart(event)">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        
        <div class="form-group" style="grid-column: span 2;">
          <label class="form-label"><?= $isRtl ? 'اسم القطعة التجاري' : 'Part Name' ?> *</label>
          <input type="text" id="newPartName" class="form-control" required placeholder="<?= $isRtl ? 'مثال: كمبروسر مكيف نيسان باترول Y62' : 'e.g. Nissan Patrol AC Compressor' ?>">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'الشركة المصنعة للسيارة' : 'Vehicle Brand' ?> *</label>
          <select id="newPartBrand" class="form-control">
            <option value="Toyota">Toyota (تويوتا)</option>
            <option value="Nissan">Nissan (نيسان)</option>
            <option value="Hyundai">Hyundai (هيونداي)</option>
            <option value="Lexus">Lexus (لكزس)</option>
            <option value="Kia">Kia (كيا)</option>
            <option value="Ford">Ford (فورد)</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            <option value="Mazda">Mazda (مازدا)</option>
            <option value="Universal">Universal (شامل)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'رقم القطعة الأصلي (OEM)' : 'OEM Part Number' ?></label>
          <input type="text" id="newPartOem" class="form-control" placeholder="e.g. 04465-33471">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'القسم' : 'Category' ?> *</label>
          <select id="newPartCategory" class="form-control">
            <option value="Engine Parts"><?= $isRtl ? 'أجزاء المحرك' : 'Engine Parts' ?></option>
            <option value="Brakes & Suspension"><?= $isRtl ? 'الفرامل والمساعدات' : 'Brakes & Suspension' ?></option>
            <option value="Transmission"><?= $isRtl ? 'ناقل الحركة (القير)' : 'Transmission' ?></option>
            <option value="Exterior & Body"><?= $isRtl ? 'البودي والهيكل الخارجي' : 'Exterior & Body' ?></option>
            <option value="Electrical & Sensors"><?= $isRtl ? 'الكهرباء والحساسات' : 'Electrical & Sensors' ?></option>
            <option value="Towing & Recovery"><?= $isRtl ? 'سطحات وطوارئ' : 'Towing & Recovery' ?></option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'السعر (ر.س)' : 'Price (SAR)' ?> *</label>
          <input type="number" step="0.01" id="newPartPrice" class="form-control" required placeholder="0.00">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'الكمية المتوفرة بالمخزون' : 'Stock Quantity' ?></label>
          <input type="number" id="newPartStock" class="form-control" value="10">
        </div>

        <div class="form-group">
          <label class="form-label"><?= $isRtl ? 'الوزن التقريبي (كجم)' : 'Weight (kg)' ?></label>
          <input type="number" step="0.1" id="newPartWeight" class="form-control" value="1.5">
        </div>

      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'الموديلات المتوافقة (افصل بينها بفاصلة)' : 'Compatibility (comma separated)' ?></label>
        <input type="text" id="newPartCompat" class="form-control" placeholder="<?= $isRtl ? 'مثال: كامري، أفالون، لكزس ES' : 'e.g. Camry, Avalon, ES350' ?>">
      </div>

      <div class="form-group">
        <label class="form-label"><?= $isRtl ? 'رابط صورة القطعة' : 'Part Image URL' ?></label>
        <input type="text" id="newPartImage" class="form-control" value="assets/images/parts/engine.svg">
      </div>

      <button type="submit" id="addPartSubmitBtn" class="btn-primary" style="width: 100%; padding: 1rem; margin-top: 0.5rem;">
        <span><?= $isRtl ? 'حفظ القطعة ونشرها في المتجر' : 'Publish Part to Marketplace' ?></span>
        <span>✅</span>
      </button>
    </form>
  </div>
</div>

<script>
const currentTenantId = '<?= e($tenant['id'] ?? '') ?>';

function handleTenantLogin(e) {
  e.preventDefault();
  const id = document.getElementById('loginTenantIdInput').value.trim();
  if (id) {
    window.location.href = `portal.php?tenantId=${encodeURIComponent(id)}`;
  }
}

function switchPortalTab(tabKey, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.portal-tab-content').forEach(c => c.style.display = 'none');
  const target = document.getElementById('tab' + tabKey.charAt(0).toUpperCase() + tabKey.slice(1));
  if (target) target.style.display = 'block';

  if (tabKey === 'rfq') {
    loadRfqData();
  }
}

function openAddPartModal() {
  document.getElementById('addPartModal').classList.add('open');
}

function closeAddPartModal() {
  document.getElementById('addPartModal').classList.remove('open');
}

async function submitNewPart(e) {
  e.preventDefault();
  const btn = document.getElementById('addPartSubmitBtn');
  btn.disabled = true;

  const payload = {
    tenant_id: currentTenantId,
    name: document.getElementById('newPartName').value.trim(),
    brand_name: document.getElementById('newPartBrand').value,
    oem_part_number: document.getElementById('newPartOem').value.trim(),
    category: document.getElementById('newPartCategory').value,
    price: document.getElementById('newPartPrice').value,
    stock_quantity: document.getElementById('newPartStock').value,
    weight: document.getElementById('newPartWeight').value,
    compatibility: document.getElementById('newPartCompat').value,
    image: document.getElementById('newPartImage').value.trim()
  };

  try {
    const res = await fetch('api/products.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await res.json();
    if (d.success) {
      Parto.showToast('تمت إضافة القطعة بنجاح إلى مخزونك!');
      closeAddPartModal();
      setTimeout(() => location.reload(), 1000);
    } else {
      alert(d.error || 'Failed to add product');
    }
  } catch (err) {
    alert('حدث خطأ أثناء حفظ القطعة');
  } finally {
    btn.disabled = false;
  }
}

async function editPartPrice(id, oldPrice) {
  const newPrice = prompt('أدخل السعر الجديد للقطعة (بالريال السعودي):', oldPrice);
  if (!newPrice || isNaN(newPrice)) return;

  try {
    const res = await fetch(`api/products.php?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: parseFloat(newPrice) })
    });
    const d = await res.json();
    if (d.success) {
      document.getElementById(`price-val-${id}`).textContent = parseFloat(newPrice).toFixed(2);
      Parto.showToast('تم تحديث السعر بنجاح');
    }
  } catch (e) {
    alert('فشل تحديث السعر');
  }
}

async function deletePart(id) {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذه القطعة من المتجر؟')) return;
  try {
    const res = await fetch(`api/products.php?id=${id}`, { method: 'DELETE' });
    const d = await res.json();
    if (d.success) {
      document.getElementById(`row-${id}`)?.remove();
      Parto.showToast('تم حذف القطعة');
    }
  } catch (e) {
    alert('فشل حذف القطعة');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`api/orders.php?id=${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    });
    const d = await res.json();
    if (d.success) {
      Parto.showToast(`تم تغيير حالة الطلب إلى ${status}`);
    }
  } catch (e) {
    alert('فشل تحديث حالة الطلب');
  }
}

async function loadRfqData() {
  const list = document.getElementById('rfqRequestsList');
  if (!list) return;
  list.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">جاري تحميل طلبات التشليح الحية...</div>`;

  try {
    const res = await fetch(`api/tashleeh.php?tenant_id=${encodeURIComponent(currentTenantId)}`);
    const d = await res.json();
    const requests = d.requests || [];

    if (requests.length === 0) {
      list.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted); background: rgba(0,0,0,0.2); border-radius: var(--radius-lg);">لا توجد طلبات تسعير معلقة حالياً.</div>`;
      return;
    }

    list.innerHTML = requests.map(r => `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-lg); padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="font-weight: 800; font-size: 1.15rem; color: #fff;">
            🚗 ${r.vehicle_make} ${r.vehicle_model} (${r.vehicle_year}) - ${r.part_name}
          </div>
          <span class="status-pill status-${r.status}">${r.status}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          العميل: ${r.customer_name} • هاتف: ${r.customer_phone} ${r.notes ? `• ملاحظات: ${r.notes}` : ''}
        </div>
        
        <!-- Quoting Row -->
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: var(--radius-md);">
          <input type="number" id="quote-price-${r.id}" placeholder="سعرك بالريال (ر.س) *" class="form-control" style="width: 160px; padding: 0.5rem 0.75rem;">
          <select id="quote-cond-${r.id}" class="form-control" style="width: 180px; padding: 0.5rem 0.75rem;">
            <option value="Used - Grade A">مستعمل نظيف (Grade A)</option>
            <option value="Used - Tested">مستعمل مفحوص ومضمون</option>
            <option value="OEM Refurbished">وكالة مجدد</option>
          </select>
          <input type="text" id="quote-notes-${r.id}" placeholder="مدة الضمان أو شروط التسليم..." class="form-control" style="flex: 1; min-width: 180px; padding: 0.5rem 0.75rem;">
          <button class="btn-primary" style="padding: 0.55rem 1.25rem;" onclick="submitVendorQuote('${r.id}')">
            إرسال العرض للعميل
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = `<div style="color: var(--danger);">فشل تحميل طلبات التسعير</div>`;
  }
}

async function submitVendorQuote(requestId) {
  const price = document.getElementById(`quote-price-${requestId}`)?.value;
  const cond = document.getElementById(`quote-cond-${requestId}`)?.value;
  const notes = document.getElementById(`quote-notes-${requestId}`)?.value;

  if (!price || parseFloat(price) <= 0) {
    Parto.showToast('يرجى إدخال السعر المقترح', 'error');
    return;
  }

  try {
    const res = await fetch('api/tashleeh.php?action=quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'quote',
        requestId: requestId,
        tenantId: currentTenantId,
        price: parseFloat(price),
        condition: cond,
        notes: notes
      })
    });
    const d = await res.json();
    if (d.success) {
      Parto.showToast('تم إرسال عرض سعرك للعميل فوراً!');
      loadRfqData();
    }
  } catch (e) {
    alert('فشل إرسال العرض');
  }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
