<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use app\models\Product;

class ProductController extends Controller
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

    public function actionIndex()
    {
        return $this->redirect(['site/index']);
    }

    public function actionView($id = null)
    {
        $id = $id ?: Yii::$app->request->get('id');

        $product = null;
        if (!empty($id)) {
            $product = Product::findActive()
                ->where(['id' => $id])
                ->with('tenant')
                ->one();
        }

        if (!$product) {
            // Fallback to first featured product if none specified
            $product = Product::findFeatured()->with('tenant')->one();
        }

        $isRtl = Yii::$app->language === 'ar';
        $relatedProducts = [];

        if ($product) {
            $relatedProducts = Product::findActive()
                ->where(['!=', 'id', $product->id])
                ->andWhere(['or', ['category' => $product->category], ['brand_name' => $product->brand_name]])
                ->with('tenant')
                ->limit(4)
                ->all();
        }

        return $this->render('view', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isRtl' => $isRtl,
        ]);
    }
}
