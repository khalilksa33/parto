<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * Order ActiveRecord Model
 *
 * @property string $id
 * @property string|null $tenant_id
 * @property string $order_number
 * @property string $customer_name
 * @property string $customer_phone
 * @property string|null $customer_email
 * @property string $delivery_city
 * @property string $delivery_address
 * @property float $total_amount
 * @property string $currency
 * @property string|null $shipping_provider
 * @property float $shipping_fee
 * @property string|null $payment_method
 * @property string|null $payment_status
 * @property string $status
 * @property string $items_json
 * @property string $created_at
 *
 * @property Tenant $tenant
 */
class Order extends ActiveRecord
{
    public static function tableName()
    {
        return 'orders';
    }

    public function rules()
    {
        return [
            [['customer_name', 'customer_phone', 'delivery_city', 'delivery_address', 'items_json'], 'required'],
            [['total_amount', 'shipping_fee'], 'number'],
            [['delivery_address', 'items_json'], 'string'],
            [['created_at'], 'safe'],
            [['id', 'tenant_id'], 'string', 'max' => 64],
            [['order_number', 'customer_name', 'customer_email', 'delivery_city', 'shipping_provider'], 'string', 'max' => 255],
            [['currency'], 'string', 'max' => 10],
            [['payment_method', 'payment_status', 'status', 'customer_phone'], 'string', 'max' => 50],
            [['order_number'], 'unique'],
            [['currency'], 'default', 'value' => 'SAR'],
            [['payment_method'], 'default', 'value' => 'mada'],
            [['payment_status'], 'default', 'value' => 'completed'],
            [['status'], 'default', 'value' => 'pending'],
            [['shipping_provider'], 'default', 'value' => 'SMSA Express'],
            [['shipping_fee'], 'default', 'value' => 25.00],
        ];
    }

    public function attributeLabels()
    {
        $isRtl = Yii::$app->language === 'ar';
        return [
            'order_number' => $isRtl ? 'رقم الطلب' : 'Order Tracking Number',
            'customer_name' => $isRtl ? 'اسم العميل' : 'Customer Name',
            'customer_phone' => $isRtl ? 'رقم الجوال' : 'Mobile Phone',
            'customer_email' => $isRtl ? 'البريد الإلكتروني' : 'Email Address',
            'delivery_city' => $isRtl ? 'مدينة التوصيل' : 'Delivery City',
            'delivery_address' => $isRtl ? 'العنوان الوطني' : 'Shipping Address',
            'total_amount' => $isRtl ? 'المبلغ الإجمالي' : 'Total Amount (SAR)',
            'shipping_provider' => $isRtl ? 'شركة الشحن' : 'Courier Provider',
            'payment_method' => $isRtl ? 'طريقة الدفع' : 'Payment Method',
            'status' => $isRtl ? 'حالة الطلب' : 'Order Status',
            'created_at' => $isRtl ? 'تاريخ الطلب' : 'Order Date',
        ];
    }

    public function getTenant()
    {
        return $this->hasOne(Tenant::class, ['id' => 'tenant_id']);
    }

    public function getItems(): array
    {
        if (empty($this->items_json)) {
            return [];
        }
        $decoded = json_decode($this->items_json, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function beforeSave($insert)
    {
        if (!parent::beforeSave($insert)) {
            return false;
        }

        if ($insert) {
            if (empty($this->id)) {
                $this->id = 'ord-' . uniqid();
            }
            if (empty($this->order_number)) {
                $this->order_number = 'PRT-' . strtoupper(substr(uniqid(), 7, 6));
            }
        }

        return true;
    }
}
