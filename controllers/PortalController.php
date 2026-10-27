<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use app\models\Tenant;
use app\models\Product;
use app\models\Order;

class PortalController extends Controller
{
    public function beforeAction($action)
    {
        if (!parent::beforeAction($action)) {
            return false;
        }

        $lang = Yii::$app->request->get('lang');
        if ($lang && in_array($lang, ['ar', 'en'])) {
            Yii::$app->session->set('parto_lang', $lang);
            Yii::$app->language = $lang;
        } else {
            Yii::$app->language = Yii::$app->session->get('parto_lang', 'ar');
        }

        return true;
    }

    public function actionIndex($tenantId = null)
    {
        $tenantId = $tenantId ?: Yii::$app->request->get('tenantId', Yii::$app->request->get('tenant_id', Yii::$app->session->get('parto_tenant_id')));

        $tenant = null;
        $products = [];
        $orders = [];

        if ($tenantId) {
            $tenant = Tenant::find()
                ->where(['or', ['id' => $tenantId], ['subdomain' => $tenantId]])
                ->one();

            if ($tenant) {
                Yii::$app->session->set('parto_tenant_id', $tenant->id);
                $products = Product::find()
                    ->where(['tenant_id' => $tenant->id, 'status' => 'active'])
                    ->orderBy(['created_at' => SORT_DESC])
                    ->all();

                $orders = Order::find()
                    ->where(['tenant_id' => $tenant->id])
                    ->orderBy(['created_at' => SORT_DESC])
                    ->limit(20)
                    ->all();
            }
        }

        $allTenants = Tenant::findActive()->all();
        $isRtl = Yii::$app->language === 'ar';

        return $this->render('index', [
            'tenant' => $tenant,
            'products' => $products,
            'orders' => $orders,
            'allTenants' => $allTenants,
            'isRtl' => $isRtl,
        ]);
    }
}
