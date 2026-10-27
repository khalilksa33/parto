<?php
/**
 * PARTO Saudi Arabia - Product View
 * Yii 2 High-Performance Controller Runner
 */

defined('YII_DEBUG') or define('YII_DEBUG', getenv('YII_DEBUG') === 'true' || getenv('YII_ENV') === 'dev');
defined('YII_ENV') or define('YII_ENV', getenv('YII_ENV') ?: 'prod');

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/config/web.php';
$app = new yii\web\Application($config);
$app->defaultRoute = 'product/view';
$app->run();
