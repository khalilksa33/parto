<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\Order;
use app\models\VinCache;
use app\models\Product;
use app\models\Tenant;
use app\models\Notification;

class ApiController extends Controller
{
    public $enableCsrfValidation = false;

    public function init()
    {
        parent::init();
        Yii::$app->response->format = Response::FORMAT_JSON;
    }

    public function actionOrders()
    {
        $orderNumber = Yii::$app->request->get('order_number');
        $tenantId = Yii::$app->request->get('tenant_id');

        if ($orderNumber) {
            $order = Order::find()->where(['order_number' => $orderNumber])->one();
            if (!$order) {
                Yii::$app->response->statusCode = 404;
                return ['success' => false, 'error' => 'Order not found'];
            }
            $data = $order->attributes;
            $data['items'] = $order->getItems();
            return ['success' => true, 'order' => $data];
        }

        $query = Order::find()->orderBy(['created_at' => SORT_DESC])->limit(100);
        if ($tenantId) {
            $query->andWhere(['tenant_id' => $tenantId]);
        }

        $orders = $query->all();
        $result = [];
        foreach ($orders as $ord) {
            $arr = $ord->attributes;
            $arr['items'] = $ord->getItems();
            $result[] = $arr;
        }

        return ['success' => true, 'orders' => $result];
    }

    public function actionCreateOrder()
    {
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
            return ['success' => false, 'error' => 'Incomplete delivery details or empty cart.'];
        }

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
            $notif = new Notification();
            $notif->id = 'notif-' . uniqid();
            $notif->recipient = 'all';
            $notif->type = 'order';
            $notif->title = 'طلب شراء جديد #' . $order->order_number;
            $notif->message = "طلب جديد للعميل {$name} بقيمة {$totalAmount} ر.س";
            $notif->read_status = 0;
            $notif->save();

            return [
                'success' => true,
                'order' => [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'total_amount' => $order->total_amount,
                    'currency' => $order->currency,
                    'status' => $order->status,
                    'delivery_address' => $order->delivery_address,
                    'delivery_city' => $order->delivery_city,
                    'shipping_provider' => $order->shipping_provider,
                    'created_at' => $order->created_at,
                ]
            ];
        }

        Yii::$app->response->statusCode = 500;
        return ['success' => false, 'error' => 'Failed to save order in database.', 'details' => $order->errors];
    }

    public function actionOrdersLegacy()
    {
        if (Yii::$app->request->isPost) {
            return $this->actionCreateOrder();
        }
        return $this->actionOrders();
    }

    public function actionVin()
    {
        $vin = strtoupper(trim(Yii::$app->request->get('vin', '')));

        if (strlen($vin) < 5) {
            Yii::$app->response->statusCode = 400;
            return ['success' => false, 'error' => 'A valid vehicle VIN number is required (at least 5 characters)'];
        }

        $cached = VinCache::find()->where(['vin' => $vin])->one();
        if ($cached) {
            $engineDetails = !empty($cached->engine_details) ? json_decode($cached->engine_details, true) : null;
            return [
                'success' => true,
                'source' => 'cache',
                'data' => [
                    'vin' => $cached->vin,
                    'make' => $cached->make,
                    'model' => $cached->model,
                    'year' => $cached->year,
                    'engineDetails' => $engineDetails,
                ]
            ];
        }

        // Fetch from NHTSA or fallback
        $apiUrl = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/" . urlencode($vin) . "?format=json";
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 5,
                'header'  => "User-Agent: PartoAutomotive/2.0\r\n"
            ]
        ]);

        $raw = @file_get_contents($apiUrl, false, $ctx);
        $make = 'Toyota';
        $model = 'Camry';
        $year = '2023';

        if ($raw) {
            $decoded = json_decode($raw, true);
            if (!empty($decoded['Results'])) {
                foreach ($decoded['Results'] as $item) {
                    $var = $item['Variable'] ?? '';
                    $val = $item['Value'] ?? null;
                    if (!$val) continue;

                    if ($var === 'Make') $make = $val;
                    elseif ($var === 'Model') $model = $val;
                    elseif ($var === 'Model Year') $year = $val;
                }
            }
        } else {
            if (str_starts_with($vin, 'JN1') || str_starts_with($vin, '5N1')) { $make = 'Nissan'; $model = 'Patrol'; }
            elseif (str_starts_with($vin, 'JT') || str_starts_with($vin, '4T1')) { $make = 'Toyota'; $model = 'Land Cruiser'; }
            elseif (str_starts_with($vin, 'KMH')) { $make = 'Hyundai'; $model = 'Sonata'; }
            elseif (str_starts_with($vin, 'WBA')) { $make = 'BMW'; $model = '5 Series'; }
        }

        $cache = new VinCache();
        $cache->vin = $vin;
        $cache->make = $make;
        $cache->model = $model;
        $cache->year = $year;
        $cache->save();

        return [
            'success' => true,
            'source' => 'nhtsa',
            'data' => [
                'vin' => $vin,
                'make' => $make,
                'model' => $model,
                'year' => $year,
            ]
        ];
    }

    public function actionProducts()
    {
        $products = Product::findActive()->all();
        return ['success' => true, 'products' => $products];
    }

    public function actionTenants()
    {
        $tenants = Tenant::findActive()->all();
        return ['success' => true, 'tenants' => $tenants];
    }
}
