<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\Order;
use app\models\Notification;

class CheckoutController extends Controller
{
    public function beforeAction($action)
    {
        // Disable CSRF validation for AJAX checkout submissions if json payload
        if ($action->id === 'submit') {
            $this->enableCsrfValidation = false;
        }

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

    public function actionSubmit()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $input = json_decode(Yii::$app->request->getRawBody(), true) ?: Yii::$app->request->post();

        $name = trim($input['customer_name'] ?? '');
        $phone = trim($input['customer_phone'] ?? '');
        $email = trim($input['customer_email'] ?? '');
        $city = trim($input['delivery_city'] ?? 'Riyadh');
        $address = trim($input['delivery_address'] ?? '');
        $items = $input['items'] ?? [];
        $carrier = $input['shipping_provider'] ?? 'SMSA Express';
        $payment = $input['payment_method'] ?? 'mada';
        $shippingFee = (float)($input['shipping_fee'] ?? 25.00);

        if (empty($name) || empty($phone) || empty($address) || empty($items)) {
            Yii::$app->response->statusCode = 400;
            return [
                'success' => false,
                'error' => 'Please provide complete delivery details and ensure cart has items.'
            ];
        }

        // Calculate subtotal
        $subtotal = 0;
        $primaryTenantId = null;
        foreach ($items as $item) {
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $price = (float)($item['price'] ?? 0);
            $subtotal += ($price * $qty);
            $tenant = $item['tenant_id'] ?? $item['tenantId'] ?? null;
            if (!$primaryTenantId && !empty($tenant)) {
                $primaryTenantId = $tenant;
            }
        }

        $totalAmount = $subtotal + $shippingFee;

        $order = new Order();
        $order->tenant_id = $primaryTenantId ?: 't-riyadh-oem';
        $order->customer_name = $name;
        $order->customer_phone = $phone;
        $order->customer_email = $email;
        $order->delivery_city = $city;
        $order->delivery_address = $address;
        $order->total_amount = $totalAmount;
        $order->currency = 'SAR';
        $order->shipping_provider = $carrier;
        $order->shipping_fee = $shippingFee;
        $order->payment_method = $payment;
        $order->payment_status = 'completed';
        $order->status = 'pending';
        $order->items_json = json_encode($items, JSON_UNESCAPED_UNICODE);

        if ($order->save()) {
            // Register high-priority merchant notification
            $notif = new Notification();
            $notif->id = 'notif-' . uniqid();
            $notif->recipient = 'all';
            $notif->title = "طلب شراء جديد #{$order->order_number}";
            $notif->message = "قام العميل {$name} بطلب قطع غيار بقيمة " . number_format($totalAmount, 2) . " ر.س";
            $notif->link = "order-success.php?order=" . $order->order_number;
            $notif->is_read = 0;
            $notif->save(false);

            Yii::$app->response->statusCode = 201;
            return [
                'success' => true,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'message' => 'Order processed and saved successfully via Yii 2'
            ];
        }

        Yii::$app->response->statusCode = 500;
        return [
            'success' => false,
            'error' => 'Database error while saving order',
            'details' => $order->getErrors()
        ];
    }

    public function actionSuccess($order = null)
    {
        $orderNumber = $order ?: Yii::$app->request->get('order');

        $orderModel = null;
        if (!empty($orderNumber)) {
            $orderModel = Order::findOne(['order_number' => $orderNumber]);
        }

        $isRtl = Yii::$app->language === 'ar';
        return $this->render('success', [
            'order' => $orderModel,
            'orderNumber' => $orderNumber,
            'isRtl' => $isRtl,
        ]);
    }
}
