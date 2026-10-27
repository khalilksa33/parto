<?php
/**
 * PARTO Saudi Arabia - Automotive Marketplace
 * Yii 2 Framework High-Performance Entry Point
 * Hostinger Production & Dual-Mode Environment Runner
 */

defined('YII_DEBUG') or define('YII_DEBUG', getenv('YII_DEBUG') === 'true' || getenv('YII_ENV') === 'dev');
defined('YII_ENV') or define('YII_ENV', getenv('YII_ENV') ?: 'prod');

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/config/web.php';

(new yii\web\Application($config))->run();
