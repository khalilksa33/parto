<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * Tenant ActiveRecord Model (Vendors, Distributors, Agencies)
 *
 * @property string $id
 * @property string $name
 * @property string $subdomain
 * @property string $status
 * @property string $business_type
 * @property string|null $owner_name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $logo
 * @property string|null $banner_gradient
 * @property float $commission_rate
 * @property string|null $warehouse_address
 * @property float $rating
 * @property string $created_at
 *
 * @property Product[] $products
 * @property Order[] $orders
 */
class Tenant extends ActiveRecord
{
    public static function tableName()
    {
        return 'tenants';
    }

    public function rules()
    {
        return [
            [['id', 'name', 'subdomain'], 'required'],
            [['commission_rate', 'rating'], 'number'],
            [['warehouse_address'], 'string'],
            [['created_at'], 'safe'],
            [['id'], 'string', 'max' => 64],
            [['name', 'owner_name', 'email'], 'string', 'max' => 255],
            [['subdomain', 'business_type', 'banner_gradient'], 'string', 'max' => 100],
            [['status', 'phone'], 'string', 'max' => 50],
            [['logo'], 'string', 'max' => 20],
            [['subdomain'], 'unique'],
            [['status'], 'default', 'value' => 'active'],
            [['rating'], 'default', 'value' => 4.90],
            [['commission_rate'], 'default', 'value' => 8.00],
        ];
    }

    public function attributeLabels()
    {
        $isRtl = Yii::$app->language === 'ar';
        return [
            'id' => 'Tenant ID',
            'name' => $isRtl ? 'اسم المتجر أو الوكالة' : 'Store / Agency Name',
            'subdomain' => $isRtl ? 'النطاق الفرعي' : 'Subdomain Slug',
            'status' => $isRtl ? 'حالة الحساب' : 'Account Status',
            'business_type' => $isRtl ? 'نوع النشاط' : 'Business Category',
            'owner_name' => $isRtl ? 'اسم المالك أو المسؤول' : 'Owner / Manager',
            'email' => $isRtl ? 'البريد الإلكتروني' : 'Email Address',
            'phone' => $isRtl ? 'رقم الهاتف' : 'Contact Phone',
            'rating' => $isRtl ? 'التقييم' : 'Rating',
        ];
    }

    public function getProducts()
    {
        return $this->hasMany(Product::class, ['tenant_id' => 'id']);
    }

    public function getOrders()
    {
        return $this->hasMany(Order::class, ['tenant_id' => 'id']);
    }

    public static function findActive()
    {
        return static::find()->where(['status' => 'active'])->orderBy(['rating' => SORT_DESC]);
    }
}
