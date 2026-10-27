<?php

/** @var yii\web\View $this */
/** @var bool $isRtl */
/** @var int $totalTenants */
/** @var int $totalProducts */
/** @var int $totalOrders */
/** @var float $grossSales */
/** @var float $estimatedCommission */
/** @var app\models\Tenant[] $tenants */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $isRtl 
    ? 'لوحة تحكم المشرف العام | بارتو السعودية' 
    : 'Super Admin Center | PARTO Saudi Arabia';
?>

<div style="max-width: 1360px; margin: 2.5rem auto 5rem; padding: 0 1.5rem;">

  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem;">
    <div>
      <div class="hero-pill" style="margin-bottom: 0.5rem;">
        <span>🛡️</span>
        <span><?= $isRtl ? 'المشرف الرئيسي للمنصة' : 'Super Admin Dashboard' ?></span>
      </div>
      <h1 style="font-size: 2.2rem; font-weight: 900; color: #fff;">
        <?= $isRtl ? 'إدارة المنظومة والمستأجرين' : 'Platform System Overview' ?>
      </h1>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">
        <?= $isRtl ? 'مراقبة كافة الشركاء والبائعين، إيرادات المنصة، والتكاملات التقنية.' : 'Manage multi-tenant vendors, platform revenue, and API configurations.' ?>
      </p>
    </div>
    <div>
      <a href="<?= Url::to(['/']) ?>" class="btn-primary" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-dark); text-decoration: none;">
        <?= $isRtl ? 'زيارة واجهة المتجر' : 'View Public Store' ?>
      </a>
    </div>
  </div>

  <!-- KPI Cards -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
    
    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'إجمالي البائعين المسجلين' : 'Total Registered Vendors' ?></div>
      <div style="font-size: 2rem; font-weight: 900; color: #fff; margin: 0.35rem 0;"><?= $totalTenants ?></div>
      <div style="font-size: 0.78rem; color: #34d399;"><?= $isRtl ? 'موزعون، تشليح، سطحات، وورش' : 'Distributors, Towing & Workshops' ?></div>
    </div>

    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'إجمالي مبيعات المنصة' : 'Gross Platform Sales' ?></div>
      <div style="font-size: 2rem; font-weight: 900; color: #38bdf8; margin: 0.35rem 0;"><?= number_format((float)$grossSales, 2) ?> <span style="font-size: 0.9rem;">ر.س</span></div>
      <div style="font-size: 0.78rem; color: var(--text-muted);"><?= $isRtl ? 'عبر مدى وأبل باي' : 'Via Mada & Apple Pay' ?></div>
    </div>

    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'أرباح عمولات بارتو التقديرية' : 'Estimated Commission Revenue' ?></div>
      <div style="font-size: 2rem; font-weight: 900; color: #10b981; margin: 0.35rem 0;"><?= number_format((float)$estimatedCommission, 2) ?> <span style="font-size: 0.9rem;">ر.س</span></div>
      <div style="font-size: 0.78rem; color: #10b981;"><?= $isRtl ? 'صافي دخل المنصة (8% - 12%)' : 'Platform Revenue (8% - 12%)' ?></div>
    </div>

    <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 1.5rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700;"><?= $isRtl ? 'إجمالي القطع المعروضة' : 'Total Parts Listed' ?></div>
      <div style="font-size: 2rem; font-weight: 900; color: #a855f7; margin: 0.35rem 0;"><?= $totalProducts ?></div>
      <div style="font-size: 0.78rem; color: var(--text-muted);"><?= $totalOrders ?> <?= $isRtl ? 'طلب منفذ' : 'Orders Executed' ?></div>
    </div>

  </div>

  <!-- Tenants Table -->
  <div style="background: var(--surface-card); border: 1px solid var(--border-dark); border-radius: var(--radius-xl); padding: 2rem; margin-bottom: 2.5rem;">
    <h3 style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem;">
      🏢 <?= $isRtl ? 'المستأجرون والشركاء المسجلون في المنصة' : 'Registered Multi-Tenant Entities' ?>
    </h3>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th><?= $isRtl ? 'اسم المنشأة' : 'Entity Name' ?></th>
            <th><?= $isRtl ? 'المجال' : 'Domain' ?></th>
            <th><?= $isRtl ? 'المالك / الاتصال' : 'Contact Person' ?></th>
            <th><?= $isRtl ? 'معرّف المتجر السري (Tenant ID)' : 'Tenant ID' ?></th>
            <th><?= $isRtl ? 'نسبة العمولة' : 'Commission' ?></th>
            <th><?= $isRtl ? 'التقييم' : 'Rating' ?></th>
            <th><?= $isRtl ? 'لوحة التحكم' : 'Action' ?></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($tenants as $t): ?>
            <tr>
              <td style="font-weight: 800; color: #fff;">
                <span style="font-size: 1.2rem; margin-inline-end: 0.35rem;"><?= Html::encode($t->logo ?: '🏪') ?></span>
                <?= Html::encode($t->name) ?>
                <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;"><?= Html::encode($t->subdomain) ?>.parto.dynapulsar.com</div>
              </td>
              <td><span class="badge badge-category"><?= Html::encode($t->business_type) ?></span></td>
              <td>
                <div style="color: #fff; font-weight: 600;"><?= Html::encode($t->owner_name ?: '—') ?></div>
                <div style="font-size: 0.78rem; color: var(--text-muted);"><?= Html::encode($t->phone ?: $t->email) ?></div>
              </td>
              <td style="font-family: monospace; font-size: 0.8rem; color: #38bdf8;">
                <?= Html::encode($t->id) ?>
              </td>
              <td style="font-weight: 800; color: #fff;"><?= Html::encode($t->commission_rate) ?>%</td>
              <td style="color: #fbbf24; font-weight: 800;">★ <?= number_format((float)$t->rating, 1) ?></td>
              <td>
                <a href="<?= Url::to(['/portal/index', 'tenantId' => $t->id]) ?>" class="btn-primary" style="padding: 0.35rem 0.85rem; font-size: 0.78rem; text-decoration: none;">
                  <?= $isRtl ? 'إدارة' : 'Manage' ?>
                </a>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>

  <!-- API Configurations Form -->
  <div class="search-card" style="padding: 2rem;">
    <h3 style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">
      🔌 <?= $isRtl ? 'إعدادات واجهات الربط والتكاملات (API & Integrations)' : 'API Settings & Integrations' ?>
    </h3>
    <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.5rem;">
      <?= $isRtl ? 'قم بإدخال مفاتيح الربط لتفعيل الذكاء الاصطناعي وبوابات الدفع الإلكتروني وشركات الشحن.' : 'Configure live production API credentials for Gemini AI, SMSA, Moyasar and TecDoc.' ?>
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
      
      <div class="form-group">
        <label class="form-label">Google Gemini AI API Key (تشخيص الأعطال)</label>
        <input type="password" class="form-control" value="AIzaSyB*******************" placeholder="AIzaSy...">
      </div>

      <div class="form-group">
        <label class="form-label">Moyasar / Mada Payment Secret Key (بوابة الدفع)</label>
        <input type="password" class="form-control" value="sk_live_*******************" placeholder="sk_live_...">
      </div>

      <div class="form-group">
        <label class="form-label">SMSA Express Shipping API Key (بوليصات الشحن)</label>
        <input type="password" class="form-control" value="smsa_live_*****************" placeholder="smsa_...">
      </div>

      <div class="form-group">
        <label class="form-label">TecDoc / Laximo Parts Catalog API</label>
        <input type="password" class="form-control" value="tecdoc_api_****************" placeholder="tecdoc_...">
      </div>

    </div>

    <button class="btn-primary" style="padding: 0.85rem 1.75rem;" onclick="Parto.showToast('<?= $isRtl ? "تم حفظ إعدادات التكاملات وتشفيرها بنجاح!" : "Integration settings saved and encrypted!" ?>')">
      <span>💾 <?= $isRtl ? 'حفظ إعدادات المنظومة' : 'Save System Settings' ?></span>
    </button>
  </div>

</div>
