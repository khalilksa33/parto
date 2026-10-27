<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'parto-marketplace',
    'name' => 'PARTO Saudi Arabia',
    'defaultRoute' => 'site/index',
    'basePath' => dirname(__DIR__),

    'bootstrap' => ['log'],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'request' => [
            // Secret key for cookie validation
            'cookieValidationKey' => 'parto-ksa-marketplace-secure-session-key-2026',
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'user' => [
            'identityClass' => 'app\models\User',
            'enableAutoLogin' => true,
            'loginUrl' => ['portal/index'],
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'mailer' => [
            'class' => \yii\symfonymailer\Mailer::class,
            'viewPath' => '@app/mail',
            'useFileTransport' => true,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'db' => $db,
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => false,
            'rules' => [
                'product/<id>' => 'product/view',
                'product.php' => 'product/view',
                'site/index' => 'site/index',
                'checkout' => 'checkout/index',
                'checkout.php' => 'checkout/index',
                'order-success' => 'checkout/success',
                'order-success.php' => 'checkout/success',
                'portal' => 'portal/index',
                'portal.php' => 'portal/index',
                'workshop' => 'workshop/index',
                'workshop.php' => 'workshop/index',
                'towing' => 'towing/index',
                'towing.php' => 'towing/index',
                'oem' => 'oem/index',
                'oem.php' => 'oem/index',
                'register' => 'site/register',
                'register.php' => 'site/register',
                'admin' => 'site/admin',
                'admin.php' => 'site/admin',
                
                // REST API routes
                'POST api/orders' => 'api/create-order',
                'GET api/orders' => 'api/orders',
                'api/orders.php' => 'api/orders-legacy',
                'api/vin' => 'api/vin',
                'api/vin.php' => 'api/vin',
                'api/tashleeh.php' => 'api/tashleeh',

                '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
            ],
        ],
    ],
    'params' => $params,
];

if (YII_ENV_DEV && class_exists('yii\gii\Module')) {
    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        'allowedIPs' => ['127.0.0.1', '::1'],
    ];
}

return $config;
