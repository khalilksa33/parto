<?php

/** @var yii\web\View $this */
/** @var string $name */
/** @var string $message */
/** @var Exception $exception */

use yii\helpers\Html;
use yii\helpers\Url;

$isRtl = Yii::$app->language === 'ar';
$this->title = $isRtl ? 'حدث خطأ | بارتو السعودية' : 'Error | PARTO Saudi Arabia';
?>

<div style="max-width: 600px; margin: 4rem auto; padding: 2rem 1.5rem; text-align: center;">
  <div class="search-card" style="padding: 3rem 2rem;">
    <div style="font-size: 3.5rem; margin-bottom: 1rem;">⚠️</div>
    <h1 style="font-size: 1.85rem; font-weight: 900; color: #fff; margin-bottom: 0.75rem;">
      <?= Html::encode($name) ?>
    </h1>
    <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 2rem; line-height: 1.6;">
      <?= nl2br(Html::encode($message)) ?>
    </p>
    <a href="<?= Url::to(['/site/index']) ?>" class="btn-primary" style="display: inline-flex; padding: 0.85rem 1.75rem; text-decoration: none;">
      <span><?= $isRtl ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home Page' ?></span>
    </a>
  </div>
</div>
