<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\Product;
use app\models\Tenant;
use app\models\VinCache;
use app\models\Order;

class SiteController extends Controller
{
    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
        ];
    }

    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        // Language resolution
        $lang = Yii::$app->request->get('lang');
        if ($lang && in_array($lang, ['ar', 'en'])) {
            Yii::$app->session->set('parto_lang', $lang);
            Yii::$app->language = $lang;
        } else {
            Yii::$app->language = Yii::$app->session->get('parto_lang', 'ar');
        }

        return true;
    }

    public function actionIndex()
    {
        // Canonical redirect if accessed via explicit /site/index
        if (Yii::$app->request->getPathInfo() === 'site/index') {
            $params = Yii::$app->request->getQueryParams();
            return $this->redirect(array_merge(['/'], $params), 301);
        }

        $products = Product::findActive()
            ->with('tenant')
            ->orderBy(['featured' => SORT_DESC, 'created_at' => SORT_DESC])
            ->all();

        $popularBrands = [
            ['name' => 'Toyota', 'logo' => 'https://cdn.worldvectorlogo.com/logos/toyota-3.svg', 'alt' => 'Toyota'],
            ['name' => 'Nissan', 'logo' => 'https://cdn.worldvectorlogo.com/logos/nissan-6.svg', 'alt' => 'Nissan'],
            ['name' => 'Hyundai', 'logo' => 'https://cdn.worldvectorlogo.com/logos/hyundai-1.svg', 'alt' => 'Hyundai'],
            ['name' => 'Lexus', 'logo' => 'assets/images/brands/lexus.svg', 'alt' => 'Lexus'],
            ['name' => 'Kia', 'logo' => 'assets/images/brands/kia.svg', 'alt' => 'Kia'],
            ['name' => 'Ford', 'logo' => 'https://cdn.worldvectorlogo.com/logos/ford-8.svg', 'alt' => 'Ford'],
            ['name' => 'Chevrolet', 'logo' => 'https://cdn.worldvectorlogo.com/logos/chevrolet.svg', 'alt' => 'Chevrolet'],
            ['name' => 'Mazda', 'logo' => 'https://cdn.worldvectorlogo.com/logos/mazda.svg', 'alt' => 'Mazda'],
            ['name' => 'BMW', 'logo' => 'assets/images/brands/bmw.svg', 'alt' => 'BMW'],
            ['name' => 'Audi', 'logo' => 'assets/images/brands/audi.svg', 'alt' => 'Audi'],
            ['name' => 'Mercedes', 'logo' => 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg', 'alt' => 'Mercedes']
        ];

        $isRtl = Yii::$app->language === 'ar';
        $categories = [
            'all' => ($isRtl ? 'جميع الأقسام' : 'All Categories'),
            'Engine Parts' => ($isRtl ? 'أجزاء المحرك' : 'Engine Parts'),
            'Brakes & Suspension' => ($isRtl ? 'الفرامل والمساعدات' : 'Brakes & Suspension'),
            'Transmission' => ($isRtl ? 'ناقل الحركة (القير)' : 'Transmission'),
            'Exterior & Body' => ($isRtl ? 'البودي والهيكل الخارجي' : 'Body & Exterior'),
            'Electrical & Sensors' => ($isRtl ? 'الكهرباء والحساسات' : 'Electrical & Sensors'),
            'Towing & Recovery' => ($isRtl ? 'سطحات وطوارئ' : 'Towing & Recovery'),
        ];

        $tenants = Tenant::findActive()->all();

        return $this->render('index', [
            'products' => $products,
            'popularBrands' => $popularBrands,
            'categories' => $categories,
            'tenants' => $tenants,
            'isRtl' => $isRtl,
        ]);
    }

    public function actionLanguage($lang)
    {
        if (in_array($lang, ['ar', 'en'])) {
            Yii::$app->session->set('parto_lang', $lang);
        }
        return $this->goBack(Yii::$app->request->referrer ?: ['site/index']);
    }

    public function actionRegister()
    {
        $isRtl = Yii::$app->language === 'ar';
        return $this->render('register', ['isRtl' => $isRtl]);
    }

    public function actionAdmin()
    {
        $isRtl = Yii::$app->language === 'ar';
        $totalTenants = Tenant::find()->count();
        $totalProducts = Product::find()->count();
        $totalOrders = Order::find()->count();
        $grossSales = Order::find()->sum('total_amount') ?: 0;
        $estimatedCommission = $grossSales * 0.095;
        $tenants = Tenant::find()->orderBy(['created_at' => SORT_DESC])->all();

        return $this->render('admin', [
            'isRtl' => $isRtl,
            'totalTenants' => $totalTenants,
            'totalProducts' => $totalProducts,
            'totalOrders' => $totalOrders,
            'grossSales' => $grossSales,
            'estimatedCommission' => $estimatedCommission,
            'tenants' => $tenants,
        ]);
    }
}

