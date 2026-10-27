<?php

/** @var yii\web\View $this */
/** @var app\models\Tenant|null $tenant */
/** @var app\models\Product[] $products */
/** @var app\models\Order[] $orders */
/** @var app\models\Tenant[] $allTenants */
/** @var bool $isRtl */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'لوحة تحكم البائع والتاجر | بارتو السعودية' 
    : 'Vendor Management Portal | PARTO Saudi Arabia';
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
          <input type="text" id="loginTenantIdInput" class="form-control" required placeholder="t-riyadh-oem / t-wadi-uhud...">
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; padding: 0.95rem;">
          <span><?= $isRtl ? 'دخول لوحة التحكم' : 'Login to Dashboard' ?></span>
          <span><?= $isRtl ? '←' : '→' ?></span>
        </button>
      </form>

      <div style="border-top: 1px solid var(--border-dark); padding-top: 1.5rem;">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          <?= $isRtl ? 'أو اختر أحد المتاجر المسجلة للتجربة السريعة:' : 'Or choose a demo registered vendor:' ?>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <?php foreach (array_slice($allTenants, 0, 5) as $t): ?>
            <a href="<?= Url::to(['/portal/index', 'tenantId' => $t->id]) ?>" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-dark); border-radius: var(--radius-md); font-size: 0.88rem; color: #fff; text-decoration: none;">
              <span><?= Html::encode($t->logo ?: '🏪') ?> <?= Html::encode($t->name) ?></span>
              <span style="color: #60a5fa; font-size: 0.78rem; font-family: monospace;"><?= Html::encode($t->subdomain) ?></span>
            </a>
          <?php endforeach; ?>
        </div>
        <div style="margin-top: 1.5rem;">
          <a href="<?= Url::to(['/site/register']) ?>" style="color: #38bdf8; font-weight: 700; font-size: 0.9rem; text-decoration: none;">
            <?= $isRtl ? '+ تسجيل بائع أو محل قطع جديد' : '+ Register New Vendor Account' ?>
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
          <?= Html::encode($tenant->logo ?: '⚙️') ?>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <h1 style="font-size: 1.65rem; font-weight: 900; color: #fff;"><?= Html::encode($tenant->name) ?></h1>
            <span class="status-pill status-accepted"><?= Html::encode($tenant->status) ?></span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            <span>🌐 <?= Html::encode($tenant->subdomain) ?>.parto.dynapulsar.com</span>
            <span>💼 <?= Html::encode($tenant->business_type) ?></span>
            <span>💰 <?= $isRtl ? 'عمولة المنصة:' : 'Commission:' ?> <?= Html::encode($tenant->commission_rate) ?>%</span>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <!-- Switcher dropdown -->
        <select onchange="window.location.href='<?= Url::to(['/portal/index']) ?>?tenantId=' + this.value" class="form-control" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem;">
          <option value=""><?= $isRtl ? 'تبديل المتجر...' : 'Switch Store...' ?></option>
          <?php foreach ($allTenants as $at): ?>
            <option value="<?= Html::encode($at->id) ?>" <?= $at->id === $tenant->id ? 'selected' : '' ?>>
              <?= Html::encode($at->logo ?: '🏪') ?> <?= Html::encode($at->name) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <button class="btn-primary" style="padding: 0.55rem 1.15rem; font-size: 0.88rem;" onclick="openAddPartModal()">
          <span>+ <?= $isRtl ? 'إضافة قطعة جديدة' : 'Add New Part' ?></span>
        </button>
        <a href="<?= Url::to(['/portal/index', 'logout' => 1]) ?>" class="btn-primary" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #f87171; padding: 0.55rem 0.95rem; font-size: 0.85rem; text-decoration: none;">
          <?= $isRtl ? 'خروج' : 'Logout' ?>
        </a>
      </div>
    </div>

    <!-- KPI Metric Cards -->
    <?php
      $totalProducts = count($products);
      $totalOrders = count($orders);
      $totalSales = 0;
      foreach ($orders as $ord) {
          $totalSales += (float)$ord->total_amount;
      }
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
        <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'تقييم المتجر' : 'Store Rating' ?></div>
        <div style="font-size: 1.8rem; font-weight: 900; color: #f59e0b; margin: 0.25rem 0;">★ <?= number_format((float)$tenant->rating, 1) ?></div>
        <div style="font-size: 0.75rem; color: #34d399;">موثق رسمياً من بارتو</div>
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
            <?php if (empty($products)): ?>
              <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  <?= $isRtl ? 'لا توجد قطع مضافة في متجرك بعد. اضغط "إضافة قطعة" للبدء.' : 'No products found. Click "Add Part" to begin.' ?>
                </td>
              </tr>
            <?php else: ?>
              <?php foreach ($products as $tp): ?>
                <tr id="row-<?= Html::encode($tp->id) ?>">
                  <td style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="<?= Html::encode($tp->image) ?>" alt="" style="width: 38px; height: 38px; object-fit: contain; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px;">
                    <a href="<?= Url::to(['/product/view', 'id' => $tp->id]) ?>" style="font-weight: 700; color: #fff; text-decoration: none;">
                      <?= Html::encode($tp->name) ?>
                    </a>
                  </td>
                  <td><?= Html::encode($tp->brand_name) ?></td>
                  <td style="font-family: monospace; color: #38bdf8;"><?= Html::encode($tp->oem_part_number ?: '—') ?></td>
                  <td><span class="badge badge-category"><?= Html::encode($tp->category) ?></span></td>
                  <td>
                    <span id="price-val-<?= Html::encode($tp->id) ?>" style="font-weight: 800; color: #38bdf8;"><?= number_format((float)$tp->price, 2) ?></span>
                  </td>
                  <td><?= (int)$tp->stock_quantity ?></td>
                  <td>
                    <a href="<?= Url::to(['/product/view', 'id' => $tp->id]) ?>" class="btn-primary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem; text-decoration: none;">
                      <?= $isRtl ? 'معاينة' : 'View' ?>
                    </a>
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
            </tr>
          </thead>
          <tbody>
            <?php if (empty($orders)): ?>
              <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                  <?= $isRtl ? 'لم يتم استلام أي طلبات بعد. ستظهر طلبات الزبائن هنا فوراً.' : 'No orders yet.' ?>
                </td>
              </tr>
            <?php else: ?>
              <?php foreach ($orders as $to): ?>
                <tr>
                  <td style="font-family: monospace; font-weight: 800; color: #38bdf8;"><?= Html::encode($to->order_number) ?></td>
                  <td>
                    <div style="font-weight: 700; color: #fff;"><?= Html::encode($to->customer_name) ?></div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);"><?= Html::encode($to->customer_phone) ?></div>
                  </td>
                  <td><?= Html::encode($to->delivery_city) ?> - <?= Html::encode($to->delivery_address) ?></td>
                  <td style="font-weight: 800; color: #34d399;"><?= number_format((float)$to->total_amount, 2) ?> ر.س</td>
                  <td><?= Html::encode($to->shipping_provider) ?></td>
                  <td><span class="status-pill status-<?= Html::encode($to->status) ?>"><?= Html::encode($to->status) ?></span></td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 3: Store Settings -->
    <div id="tabSettings" class="portal-tab-content" style="display: none;">
      <div class="search-card" style="max-width: 650px; padding: 2rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 1.5rem;">
          ⚙️ <?= $isRtl ? 'بيانات وحساب المنشأة' : 'Store Settings & Profile' ?>
        </h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'اسم المتجر' : 'Store Name' ?></label>
            <input type="text" class="form-control" value="<?= Html::encode($tenant->name) ?>" readonly>
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'معرف الرابط (Subdomain)' : 'Subdomain' ?></label>
            <input type="text" class="form-control" value="<?= Html::encode($tenant->subdomain) ?>" readonly>
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'معرف المستأجر السري (Tenant ID)' : 'Secret Tenant ID' ?></label>
            <input type="text" class="form-control" value="<?= Html::encode($tenant->id) ?>" readonly style="font-family: monospace; color: #38bdf8;">
          </div>
          <div class="form-group">
            <label class="form-label"><?= $isRtl ? 'نسبة عمولة المنصة' : 'Commission Rate' ?></label>
            <input type="text" class="form-control" value="<?= Html::encode($tenant->commission_rate) ?>%" readonly>
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
const currentTenantId = '<?= Html::encode($tenant ? $tenant->id : '') ?>';

function handleTenantLogin(e) {
  e.preventDefault();
  const id = document.getElementById('loginTenantIdInput').value.trim();
  if (id) {
    window.location.href = `<?= Url::to(['/portal/index']) ?>?tenantId=${encodeURIComponent(id)}`;
  }
}

function switchPortalTab(tabKey, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.portal-tab-content').forEach(c => c.style.display = 'none');
  const target = document.getElementById('tab' + tabKey.charAt(0).toUpperCase() + tabKey.slice(1));
  if (target) target.style.display = 'block';
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
      Parto.showToast('<?= $isRtl ? "تمت إضافة القطعة بنجاح إلى مخزونك!" : "Part added successfully to inventory!" ?>');
      closeAddPartModal();
      setTimeout(() => location.reload(), 1000);
    } else {
      alert(d.error || 'Failed to add product');
    }
  } catch (err) {
    alert('<?= $isRtl ? "حدث خطأ أثناء حفظ القطعة" : "Error saving part" ?>');
  } finally {
    btn.disabled = false;
  }
}
</script>
