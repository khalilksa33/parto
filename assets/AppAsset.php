<?php

namespace app\assets;

use yii\web\AssetBundle;

/**
 * Main application asset bundle for PARTO marketplace.
 */
class AppAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'assets/css/style.css',
    ];
    public $js = [
        'assets/js/main.js',
        'assets/js/chat.js',
    ];
    public $depends = [
        'yii\web\YiiAsset',
    ];
}
