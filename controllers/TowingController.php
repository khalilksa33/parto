<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;

class TowingController extends Controller
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
        $isRtl = Yii::$app->language === 'ar';
        return $this->render('index', ['isRtl' => $isRtl]);
    }
}
